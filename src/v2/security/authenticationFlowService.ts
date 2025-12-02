// src/v2/security/authenticationFlowService.ts

/**
 * @description This AuthenticationFlowService class orchestrates the complete authentication flow,
 * integrating login, rate limiting, reCAPTCHA risk assessment, MFA handling, and security logging.
 */

import { injectable } from 'tsyringe';
import { LoginService } from "./login/loginService";
import { RateLimiterService } from "./rateLimiter/rateLimiterService";
import { RecaptchaService } from "./recaptcha/recaptchaService";
import { SecurityLoggerService } from "./logger/loggerService";
import { MfaSessionService } from "./mfa/mfaService";
import { HttpError } from "../system/errorHandler/httpError";
import { OtpService } from "./otp/otpService";

@injectable()
export class AuthenticationFlowService {

    constructor(
        private readonly _loginService: LoginService, // Main authentication and JWT issuance
        private readonly _rateLimiterService: RateLimiterService, // Applies limits to IP addresses
        private readonly _recaptchaService: RecaptchaService, // reCAPTCHA risk evaluation
        private readonly _loggerService: SecurityLoggerService, // Mariadb logging of security events
        private readonly _mfaSessionService: MfaSessionService, // MFA session handler (Redis)
        private readonly _otpService: OtpService
    ) {}

    // Standardised response format
    private createResponse(statusCode: number, body: any) {
        return { statusCode, body };
    }

    // Login hanling with reCAPTCHA, Rate Limiting, and MFA
    public async initiateLogin(
        username: string, 
        password: string, 
        recaptchaToken: string, 
        ipAddress: string, 
        correlationId: string, 
        userAgent: string
    ): Promise<{ statusCode: number, body: any }> {

        // --- 1. IP checking (Rate Limit) ---
        await this._rateLimiterService.checkIpBlocked(ipAddress);

        // --- 2. Risk evaluation (reCAPTCHA) ---
        const recaptchaScore = await this._recaptchaService.createAssessment(recaptchaToken, 'LOGIN');
        const evaluationResult = this._recaptchaService.assessRiskFromRecaptchaScore(recaptchaScore);
        
        // --- 3. Security actions ---
        if (!evaluationResult.isAllowed) {
            
            // A. BLOCK (Low reCAPTCHA score)
            if (evaluationResult.requiredAction === 'BLOCK') {
                await this._loggerService.logFailure(correlationId, ipAddress, userAgent, username, 'BLOCKED_BY_RECAPTCHA');
                throw new HttpError("Wrong username or password.", 403, true); // Response recommended by Google
            }
        }
        
        // --- 4. Checking credentials (password) ---
        // Returns user info if valid or null
        const authResult = await this._loginService.authenticateUser(username, password); 

        if (!authResult) {
            // Log et Rate Limit if invalid credentials
            await this._rateLimiterService.recordFailure(ipAddress);
            await this._loggerService.logFailure(correlationId, ipAddress, userAgent, username, 'Invalid credentials');
            throw new HttpError("Identifiants invalides.", 401, true);
        }
        
        // --- 5. Final decisin / MFA handling ---
        
        const isMfaRequired = evaluationResult.requiredAction === 'MFA_REQUIRED';
        
        if (isMfaRequired) {
            
            // A. MFA Required
            await this._rateLimiterService.recordFailure(ipAddress); // Treat the MFA as a failure for the Rate Limiting
            const authSessionToken = await this._mfaSessionService.createSession(username, authResult.privilege); // Start a login session for MFA

            await this._loggerService.logSuccess(correlationId, ipAddress, userAgent, username, 'MFA_REQUIRED', authSessionToken);

            return this.createResponse(401, {
                status: 'CHALLENGE_REQUIRED',
                challengeType: 'MFA',
                authSessionToken: authSessionToken,
                message: 'Vérification de sécurité supplémentaire requise.'
            });

        } else {
            
            // B. Final success (No MFA required or high reCAPTCHA score)
            const finalResponse = await this._loginService.generateFinalToken(username, authResult.privilege);

            await this._loggerService.logSuccess(correlationId, ipAddress, userAgent, username, 'SUCCESS');
            
            return this.createResponse(200, finalResponse);
        }
    }


    /**
     * Handles the MFA code sending request.
     * @param authSessionToken The MFA session token.
     * @returns A success message.
     */
    public async sendMFACode(
        authSessionToken: string, 
        ipAddress: string, 
        correlationId: string, 
        userAgent: string
    ): Promise<{ message: string }>{
        // 1. Retrieving the MFA session from Redis
        const sessionData = await this._mfaSessionService.getSession(authSessionToken);

        if (!sessionData) {
            // Invalid, expired or unknown session
            await this._loggerService.logFailure(correlationId, ipAddress, userAgent, 'UNKNOWN/EXPIRED', 'MFA_SESSION_EXPIRED');
            throw new HttpError("Session MFA invalide ou expirée. Veuillez vous reconnecter.", 401, true);
        }
        // 2. Checking if MFA was already validated (to prevent reusing the same token)
        if (sessionData.mfa_validated) {
            throw new HttpError("Session MFA déjà complétée.", 409, true); 
        }
        try {
            await this._mfaSessionService.triggerOtpSend(authSessionToken, sessionData);
        } catch (error) {
            await this._loggerService.logFailure(correlationId, ipAddress, userAgent, sessionData.username, 'OTP_SEND_FAILED');
            throw new HttpError("Échec de l'envoi du code OTP. Veuillez réessayer.", 500, false);
        }
        await this._loggerService.logSuccess(correlationId, ipAddress, userAgent, sessionData.username, 'OTP_SENT_SUCCESSFULLY');

        return { message: "Code OTP envoyé avec succès." };
        
    }

    /**
     * Gère la vérification finale du code OTP.
     */
    public async verifyMfaCode(
        authSessionToken: string, 
        otpCode: string,
        ipAddress: string, 
        correlationId: string, 
        userAgent: string
    ): Promise<any> { // Retourne le JWT final
        
        // 1. Récupérer la session de Redis
        const sessionData = await this._mfaSessionService.getSession(authSessionToken);
        
        if (!sessionData) {
            await this._loggerService.logFailure(correlationId, ipAddress, userAgent, 'UNKNOWN/EXPIRED', 'MFA_VERIFY_EXPIRED');
            throw new HttpError("Session MFA invalide ou expirée. Veuillez vous reconnecter.", 401, true);
        }
        
        // 2. Vérification du Code OTP
        // On utilise le username de la session et le code fourni par le client.
        const verifiedSessionData = await this._mfaSessionService.verifyOtpCode(authSessionToken, otpCode);
        
        if (!verifiedSessionData) {
            // Log et possiblement incrémenter un compteur d'échecs OTP dans la session Redis si nécessaire
            await this._loggerService.logFailure(correlationId, ipAddress, userAgent, sessionData.username, 'OTP_VERIFICATION_FAILED');
            throw new HttpError("Code OTP invalide.", 401, true);
        }
        
        // 3. Succès : Nettoyage et Génération du JWT Final
        
        // A. Nettoyage de la session MFA (pour éviter la réutilisation)
        await this._mfaSessionService.deleteSession(authSessionToken);
        
        // B. Log du succès final
        await this._loggerService.logSuccess(correlationId, ipAddress, userAgent, sessionData.username, 'FULL_LOGIN_SUCCESS');
        
        // C. Génération du JWT final avec les données de la session (y compris le privilege)
        const finalResponse = await this._loginService.generateFinalToken(sessionData.username, sessionData.privilege);
        
        return finalResponse;
    }

}