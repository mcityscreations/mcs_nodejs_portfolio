// src/v2/security/mfa/mfaRepository.ts
/**
 * @description This MfaSessionRepository class provides methods to manage MFA session data
 * in Redis, including saving, retrieving, and deleting MFA session tokens.
 */
import { injectable } from 'tsyringe';
import { RedisService } from "../../database/redis/redisService";

const MFA_SESSION_TTL_SECONDS = 5 * 60; // 5 minutes

@injectable()
export class MfaSessionRepository {
    
    constructor (private readonly redisClient: RedisService){}

    public async save(token: string, data: any): Promise<void> {
        // Clé formatée : mfa:session:<token>
        const key = `mfa:session:${token}`;
        const dataString = JSON.stringify(data);
        
        // Commande Redis : SET key value EX seconds
        await this.redisClient.setWithTTL(key, dataString, MFA_SESSION_TTL_SECONDS);
    }
    
    public async find(token: string): Promise<string | null> {
        const key = `mfa:session:${token}`;
        return this.redisClient.get(key); // Retourne la chaîne JSON ou null
    }
    
    public async delete(token: string): Promise<void> {
        const key = `mfa:session:${token}`;
        await this.redisClient.del(key);
    }
}