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
        
        // Délégation du stockage au dépôt
        await this._MFArepository.save(token, data); 

        return token;
    }

    /**
     * Retrieves the data of an MFA session. Returns null if the token is invalid,
     * expired (TTL elapsed), or if the data is corrupted.
     */
    public async getSession(token: string): Promise<IMfaSessionData | null> {
        
        // Le dépôt gère l'appel brut à Redis et le TTL
        const dataString = await this._MFArepository.find(token); 

        if (!dataString) {
            // La session est absente (jamais créée ou expirée par TTL)
            return null; 
        }

        try {
            // Le service gère le parsing JSON (Logique métier)
            const data: IMfaSessionData = JSON.parse(dataString);
            
            // Validation simple des champs requis pour éviter la corruption
            if (!data.username || !data.privilege || typeof data.mfa_validated === 'undefined') {
                console.error(`MfaSessionService: Données de session invalides pour le jeton ${token}.`);
                return null;
            }

            return data;
        } catch (error) {
            // Erreur de parsing JSON (données Redis corrompues)
            console.error(`MfaSessionService: Erreur de parsing JSON pour le jeton ${token}.`, error);
            return null;
        }
    }

    /**
     * Supprime manuellement une session MFA.
     * Doit être appelé après une validation MFA réussie pour éviter la réutilisation du jeton.
     */
    public async deleteSession(token: string): Promise<void> {
        // Le dépôt gère la commande DEL de Redis
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
    
        // 1. Charger et valider la session
        const mfaSession = await this.getSession(sessionID);
        
        if (!mfaSession || mfaSession.mfa_validated) {
            throw new HttpError("Session MFA invalide ou expirée.", 401, true);
        }

        // 2. Vérification de l'expiration du code (si vous avez stocké otpExpiresAt)
        if (mfaSession.otpExpiresAt && Date.now() > mfaSession.otpExpiresAt) {
            throw new HttpError("Code OTP expiré.", 401, true);
        }
        
        // 3. Vérification de la valeur
        if (mfaSession.otpCode !== otpCode) {
            throw new HttpError("Code OTP invalide.", 401, true);
        }

        // 4. Succès: Marquer la session comme validée (et nettoyer le code OTP)
        mfaSession.mfa_validated = true;
        mfaSession.otpCode = undefined; // Supprimer le code pour empêcher la réutilisation

        // 5. Sauvegarder l'état de validation
        await this._MFArepository.save(sessionID, mfaSession);
        
        return mfaSession; // Retourne les données de session validées
    }
}