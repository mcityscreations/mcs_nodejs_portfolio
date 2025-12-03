/**
 * @class UsersRepository
 * @description This class handles database requests
 */
import { execute } from "../database/sqlEngine";

export class UsersRepository {
    
    public async getUserContactInfo(username: string): Promise<{ phoneNumber: string, email: string } | null> {
        const sqlRequest = `SELECT phone_number, email FROM users_index WHERE username = ?`;
        const result = await execute(sqlRequest, [username], 'oauth', false); 
        
        if (result.length === 0) {
            return null;
        }
        return { phoneNumber: result[0].phone_number, email: result[0].email };
    }
}