import { SecurityLogRepository } from "./loggerRepository";
import { injectable } from 'tsyringe';

@injectable()
export class SecurityLoggerService {
    constructor(private readonly _logRepository: SecurityLogRepository) {}

    /**
     * Loggue une tentative de connexion réussie.
     */
    public async logSuccess(correlationId: string,  ip: string, userAgent: string, username: string, reason?: string, authSessionToken?: string): Promise<void> {
        const handledReason = reason || '';
        const handledSessionAuthToken = authSessionToken || '';
        // La raison est null ou vide pour le succès
        await this._logRepository.logAttempt(correlationId, handledSessionAuthToken, ip, userAgent, username, true, handledReason);
    }

    /**
     * Loggue une tentative de connexion échouée.
     */
    public async logFailure(correlationId: string, ip: string, userAgent: string, username: string, reason: string, authSessionToken?: string): Promise<void> {
        const handledSessionAuthToken = authSessionToken || '';
        await this._logRepository.logAttempt(correlationId, handledSessionAuthToken, ip, userAgent, username, false, reason);
    }
}