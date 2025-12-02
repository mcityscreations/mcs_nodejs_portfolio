// src/v2/security/login/loginService.ts
/**
 * @module LoginService
 * @description This module handles user login operations.
 */
import { Request } from "express";
import { promisify } from "util";
import { injectable } from 'tsyringe';
import { scrypt as scryptAsync, timingSafeEqual } from "crypto";
const scrypt = promisify(scryptAsync);

import { HttpError } from "../../system/errorHandler/httpError";
import { execute } from "../../database/sqlEngine";
import { generatePassword } from "./generatePassword/generatePassword";
import { JWTService } from "../jwt/jwtService";


@injectable()
export class LoginService {

    constructor(
        private readonly _jwtService: JWTService,
    ) {}

    public async authenticateUser(username: string, password: string): Promise<{username: string, privilege: string} | null> {

        try {
            const userData = await this.checkUserId(username);
            const isValid = await this.checkPassword(username, password);
            return isValid.isValid? { username: userData.username, privilege: userData.privilege } : null;
        } catch (error) {
            throw error;
        }
    }

    public async checkUserId(username: string): Promise<{username: string, privilege: string}> {
       // Validate the username
        if (!username || username === "") throw new HttpError("A username must be provided for authentication", 400, true);
    
        try {
            // Prepare the SQL query to check if the user ID exists
            const sqlQuery = `
            SELECT
                users_index.username AS username, 
                users_privileges.privilege AS privilege
            FROM 
                users_index
            INNER JOIN 
                users_privileges ON users_index.username = users_privileges.username
            WHERE 
                users_index.username = ?`;
            const result = await execute(sqlQuery, [username], 'oauth', false);
            if (result.length === 0) { 
                throw new HttpError("Invalid username or password.", 401, true);
            } 
    
            // Check if the account is active
            const sqlQuery2 = `SELECT account_active FROM users_index WHERE username= ?`;
            const isAccountActive = await execute(sqlQuery2, [username], 'oauth', false);
            if (isAccountActive.length === 0 || isAccountActive[0].account_active !== 1) {
                throw new HttpError("Your account has been disabled. Please contact your webmaster.", 401, true);
            }
            return {
                username: result[0].username,
                privilege: result[0].privilege,
            }
    
        } catch (error: any) {
            if (error.code == 404) {
                throw new HttpError("Invalid username or password.", 401, true);
            } else {
                throw error;
            }
     
        }
    }

    private async checkPassword(username: string, password: string): Promise<{isValid: boolean}> {
        // Validate the inputs
        if (!username || username === "" || username.trim() === '') throw new HttpError("A username must be provided for authentication", 400);
        if (!password || password === "" || password.trim() === '') throw new HttpError("A password must be provided for authentication", 400);  
        try {
            // Prepare the SQL query to check the password
            const sqlQuery = `
            SELECT 
                users_index.password AS password ,
                users_index.pass_salt AS pass_salt
            FROM 
                users_index 
            WHERE 
                users_index.username = ?`;
            const result = await execute(sqlQuery, [username], 'oauth', false);
            if (result.length === 0) {
                throw new HttpError("Invalid username or password.", 401, true);
            } else {
                const { password: storedPassword, pass_salt: storedSalt } = result[0];
    
            // 4. Comparing passwords
            const derivedKey: any = await scrypt(password, storedSalt, 64);
            const storedKey = Buffer.from(storedPassword, 'hex');
            const isMatch = timingSafeEqual(derivedKey, storedKey);
    
            if (isMatch) {
                return { isValid: true };
            } else {
                throw new HttpError("Invalid username or password.", 401, true);
            }
                
            }
        } catch (error: any) {
            if (error.code == 404) {
                throw new HttpError("Invalid username or password.", 401, true);
            } else {
                if (error.code && error.message) {
                    throw error;
                } else {
                   throw new HttpError("Invalid username or password.", 401, true);
                }
            }
        }
    }

    public async generateFinalToken(username: string, privilege: string) {
        // Checking params
        if (!username || username === "") throw new HttpError("A username must be provided to generate a JWT token", 400, true);
        if (!privilege || privilege === "") throw new HttpError("User privilege must be provided to generate a JWT token", 400, true);
        // Generating token
        const token = this._jwtService.createToken({
                    username: username,
                    privilege: privilege,
                });
                return {
                    username: username,
                    privilege: privilege,
                    jwt_token: token.token
                };
    }

    public async generatePassword() {
        const password = 'mypassword123!';
        return generatePassword(password)
    }

}