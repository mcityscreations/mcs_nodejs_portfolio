import { sign } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import { HttpError } from "../../system/errorHandler/httpError";
import { randomUUID } from "node:crypto";
import { JWTRepository } from "./jwtRepository";
import { injectable } from 'tsyringe';

interface IJwtPayload {
    username: string;
    privilege: string;
}

interface ITokenPayload extends jwt.JwtPayload {
    username: string;
    privilege: string;  
}


@injectable()
export class JWTService {
    private _JWT_PRIVATE_KEY: string;
    private _JWT_PUBLIC_KEY: string;

    constructor(private readonly _jwtRepository: JWTRepository) {
        
        // 1. Loading private JWT private key
        const PRIVATE_KEY_CONTENT = process.env.JWT_PRIVATE_KEY;
        if (!PRIVATE_KEY_CONTENT || PRIVATE_KEY_CONTENT === '') {
            throw new HttpError('JWT private key is not configured.', 500, false);
        }
        // Handling RS256 key formatting
        this._JWT_PRIVATE_KEY = PRIVATE_KEY_CONTENT.replace(/\\n/g, '\n');
        
        // 2. Loading public JWT public key
        const PUBLIC_KEY_CONTENT = process.env.JWT_PUBLIC_KEY;
        if (!PUBLIC_KEY_CONTENT || PUBLIC_KEY_CONTENT === '') {
            throw new HttpError('JWT public key is not configured.', 500, false);
        }
        this._JWT_PUBLIC_KEY = PUBLIC_KEY_CONTENT.replace(/\\n/g, '\n');
    }

    public createToken(payload: IJwtPayload): { token: string } {
        // 1. Validating configuration
        if (!this._JWT_PRIVATE_KEY || this._JWT_PRIVATE_KEY == '') {
            throw new HttpError('JWT private key is not configured', 500, false);
        }
        
        // 2. Validating payload
        if (!payload.username || payload.username === "") {
            throw new HttpError('Unable to authenticate user: username is missing', 401, true);
        }
        if (!payload.privilege || payload.privilege === "") {
            throw new HttpError('Unable to authenticate user: privilege is missing', 401, true);
        }
    
        try {
            // 3. Synchronous token generation
            const jti = randomUUID();
            const token = sign(
                { user: payload.username, privilege: payload.privilege, jti: jti},
                this._JWT_PRIVATE_KEY,
                { algorithm: 'RS256', expiresIn: '1h' }
            );
    
            return { token: token };
    
        } catch (error) {
            // 4. Error handling
            console.error('JWT token generation failed:', error);
            throw new HttpError('An unexpected error occurred during token generation', 500, false);
        }
    }

    public async verifyToken(token: string): Promise<ITokenPayload | null> {
        let decodedToken;

        // Checking the secret key
        if (!this._JWT_PUBLIC_KEY || this._JWT_PUBLIC_KEY == '') {
            throw new HttpError('JWT private key is not configured', 500, false);
        }

        // Trying to decode the token
        try {
            decodedToken = jwt.verify(token, this._JWT_PUBLIC_KEY);
        } catch (error: any) {
            // If verification fails (token has expired, wrong signature...)
            if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
                throw new HttpError('Invalid token', 401, true); 
            }
            // Handle unexpected errors
            console.error('Unexpected error during JWT verification:', error);
            throw new HttpError('An unexpected error occurred during token verification', 500, false);
        }

        // Is decodedToken an object and is the property JTI present ?
        if (typeof decodedToken !== 'object' || !decodedToken.jti) {
            // Unable to decode the token or JTI is missing
            throw new HttpError('Invalid or revoked token', 500, false);
        }

        // Is the token revoked ?
        const isRevoked = await this._jwtRepository.hasJTI(decodedToken.jti);
        if (isRevoked) {
            throw new HttpError('Token has been revoked', 401, true);
        }

        return decodedToken as ITokenPayload;
    }

    public async revokeToken(token: string): Promise<void> {
    try {
        const decoded = jwt.decode(token);

        if (typeof decoded === 'object' && decoded !== null && decoded.jti && decoded.exp) {
            // Calculating remaining time to live
            const now = Math.floor(Date.now() / 1000);
            const ttlSeconds = decoded.exp - now;

            if (ttlSeconds > 0) {
                // The JTI must be stored in Redis with a TTL equal to the remaining time of the token.
                await this._jwtRepository.addJTI(decoded.jti, ttlSeconds);
                return;
            }
        }
        // Si le token n'est pas décodable, n'a pas de JTI, ou est déjà expiré, ne rien faire.
    } catch (error) {
        // En cas d'erreur de décodage, ignorer la révocation pour éviter le crash.
        console.error('Failed to decode or revoke token:', error);
    }
}
}