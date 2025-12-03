// src/v2/security/mfa/mfaService.ts
/**
 * @description This MfaSessionService class provides methods to create, retrieve,
 * and delete MFA session tokens using the MfaSessionRepository.
 */
import { injectable } from 'tsyringe';
import { randomUUID } from "node:crypto";
import { MfaSessionRepository } from "./mfaRepository";
import { IMfaSessionData, IOTPPayload } from "../securityInterface";
import { HttpError } from '../../system/errorHandler/httpError';
import { OtpService } from '../otp/otpService';


@injectable()
export class MfaSessionService {

    constructor(
        private readonly _MFArepository: MfaSessionRepository,
        private readonly _otpService: OtpService,
    ) {}

/** -- SESSIONS HANDLING -- */
    public async createSession(username: string, privilege: string): Promise<string> {
        const token = randomUUID();
        const data = { username: username, privilege: privilege, mfa_validated: false, createdAt: Date.now() };
        
        await this._MFArepository.save(token, data); 

        return token;
    }

    /**
     * Retrieves the data of an MFA session. Returns null if the token is invalid,
     * expired (TTL elapsed), or if the data is corrupted.
     */
    public async getSession(token: string): Promise<IMfaSessionData | null> {
        // Retrieving raw data string from repository
        const dataString = await this._MFArepository.find(token); 

        if (!dataString) {
            // No data found for the given token (invalid or expired)
            return null; 
        }

        try {
            // Then parsing JSON string to object
            const data: IMfaSessionData = JSON.parse(dataString);
            
            // Simple validation of required fields
            if (!data.username || !data.privilege || typeof data.mfa_validated === 'undefined') {
                console.error(`MfaSessionService: Données de session invalides pour le jeton ${token}.`);
                return null;
            }

            return data;
        } catch (error) {
            // Parsing error
            console.error(`MfaSessionService: Erreur de parsing JSON pour le jeton ${token}.`, error);
            return null;
        }
    }

    /**
     * Deletes an MFA session token from the repository.
     * Must be called after a successful MFA validation to prevent token reuse.
     */
    public async deleteSession(token: string): Promise<void> {
        await this._MFArepository.delete(token);
    }

    
/** -- OTP HANDLING -- */
    public async triggerOtpSend(authSessionToken: string, sessionData: IMfaSessionData): Promise<void> {
        
        // Generating the OTP code
        const otpPayload: IOTPPayload = this._otpService.generateOTP(sessionData.username);

        // Storing the OTP into Redis MFA Session
        sessionData.otpCode = otpPayload.otp; 
    
        // Adding OTP TTL to MFA Session data object
        sessionData.otpExpiresAt = otpPayload.expiresAt;
        
        // Updating MFA Session Data in Redis
        await this._MFArepository.save(authSessionToken, sessionData); 

        // Sending code by SMS
        await this._otpService.sendMFACode(otpPayload);
    }


    public async verifyOtpCode(sessionID: string, otpCode: string): Promise<IMfaSessionData> {
    
        // 1. Loading the MFA session data
        const mfaSession = await this.getSession(sessionID);
        
        if (!mfaSession || mfaSession.mfa_validated) {
            throw new HttpError("Session MFA invalide ou expirée.", 401, true);
        }

        // 2. Checking expiration
        if (mfaSession.otpExpiresAt && Date.now() > mfaSession.otpExpiresAt) {
            throw new HttpError("Code OTP expiré.", 401, true);
        }
        
        // 3. Checking OTP code
        if (mfaSession.otpCode !== otpCode) {
            throw new HttpError("Code OTP invalide.", 401, true);
        }

        // 4. Successful validation
        mfaSession.mfa_validated = true;
        mfaSession.otpCode = undefined; // Deleting OTP code after validation

        // 5. Saving updated session data
        await this._MFArepository.save(sessionID, mfaSession);
        
        return mfaSession; // Returning updated session data
    }
}