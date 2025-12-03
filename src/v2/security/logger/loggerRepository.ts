// src/v2/security/logger/loggerRepository.ts
/**
 * @description This SecurityLogRepository class provides methods to log security-related events,
 * such as login attempts, into the database for auditing and monitoring purposes.
 */
import { execute } from "../../database/sqlEngine";
import { injectable } from 'tsyringe';

@injectable()
export class SecurityLogRepository {

    /**
     * Records a login attempt in the security logs table.
     * @param correlationId  Unique identifier for the log entry.
     * @param ip IP address of the request.
     * @param userAgent User agent string from the request headers.
     * @param username The username.
     * @param success True or false depending on the success of the attempt.
     * @param reason The reason of the failure (wrong password, blocked IP, etc.). Null if success is true.
     */
    public async logAttempt(correlationId: string, authSessionToken: string, ip: string, userAgent: string, username: string, success: boolean, reason: string | null): Promise<void> {
        const sqlRequest = `
            INSERT INTO users_login_journal (id, correlation_id, auth_session_token, username, attempt_time, ip_address, user_agent, success, reason)
            VALUES (NULL, ?, ?, ?, NOW(), ?, ?, ?, ?)
        `;
        const params = [correlationId, authSessionToken, username, ip, userAgent, success, reason];
        await execute(sqlRequest, params, 'oauth', false);
    }
}