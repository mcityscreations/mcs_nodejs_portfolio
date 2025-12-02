// src/v2/security/rateLimiter/rateLimiterService.ts
/**
 * @description This RateLimiterService class provides methods to enforce rate limiting
 * on login attempts based on IP addresses, helping to prevent brute-force attacks.
 */
import { injectable } from 'tsyringe';
import { HttpError } from '../../system/errorHandler/httpError';
import { RateLimiterRepository } from './rateLimiterRepository';

@injectable()
export class RateLimiterService {
    // Threshold of failed attempts before temporary blocking
    private readonly MAX_FAILURES_IP = 10; 

    constructor(private readonly repository: RateLimiterRepository) {}

    /**
     * Checks if an IP address is temporarily blocked by Rate Limiting.
     * Throws an HttpError if the threshold is exceeded.
     *
     * @param ip Yhe IP address to check.
     */
    public async checkIpBlocked(ip: string): Promise<void> {
        const failureCount = await this.repository.getFailureCount(ip);
        
        if (failureCount >= this.MAX_FAILURES_IP) {
            // Throws an error that will be caught by the global ErrorHandler
            throw new HttpError(
                "Trop de tentatives de connexion échouées. Veuillez réessayer dans quelques minutes.", 
                429, // 429 Too Many Requests
                true
            );
        }
    }
    
    /**
     * Records a failed login attempt for the given IP address.
     * Is called AFTER a password verification failure.
     */
    public async recordFailure(ip: string): Promise<void> {
        await this.repository.incrementFailureCount(ip);
    }
}