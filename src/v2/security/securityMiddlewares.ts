import { expressjwt } from 'express-jwt';
import { Request, Response, NextFunction, Handler } from 'express';
import { injectable } from 'tsyringe';
import { randomUUID } from 'node:crypto';
import { HttpError } from '../system/errorHandler/httpError';
import { UserRole } from "./securityInterface";

@injectable()
export class AuthMiddlewares {

    // JWT config
    private _mandatoryJwtMiddleware!: Handler;
    private _optionalJwtMiddleware!: Handler;

    constructor() {
        // Loading JWT keys
        const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY;
        if (!JWT_PUBLIC_KEY) {
            throw new HttpError("JWT public key is not defined in environment variables.", 500, false);
        }
        const formattedKey = JWT_PUBLIC_KEY.replace(/\\n/g, '\n');
        this.initializeJwtMiddlewares(formattedKey);
    }

    /** Private method that initialises both mandatory and optional middlewares */
    private initializeJwtMiddlewares(formattedKey: string): void {
        // This optional middleware allows access to a specified ressource but the content may vary based on authentication
        this._optionalJwtMiddleware = expressjwt({
            secret: formattedKey,
            algorithms: ['RS256'],
            requestProperty: 'authData',
            credentialsRequired: false,
        });

        // Only authenticated users will access routes protected by this middleware
        this._mandatoryJwtMiddleware = expressjwt({
            secret: formattedKey,
            algorithms: ['RS256'],
            requestProperty: 'authData',
            credentialsRequired: true,
        });
    }

        public getMandatoryAuthMiddleware(): Handler {
        return this._mandatoryJwtMiddleware;
    }

    public getOptionalAuthMiddleware(): Handler {
        return this._optionalJwtMiddleware;
    }

    public jwtErrorHandler(err: any, req: Request, res: Response, next: NextFunction): void {  
        // express-jwt raises an 'UnauthorizedError' if the token is invalid or has expired.
        // If credentialsRequired is false, it will NOT raise an error if no token is provided.
        // It will only raise an error if a token is provided but invalid.
        if (err && err.name === 'UnauthorizedError') {
            throw new HttpError("Token has expired or is invalid.", 401, true);
        }
        
        // If it's not a JWT error (or if err is null/undefined), 
        // we pass to the next error handler in the chain.
        next(err); 
    }
    

    /**
     * Returns a middleware that checks if the authenticated user
     * has at least one of the required roles.
     * @param requiredRoles Required roles to access the resource.
     */
    public permissionGuard(requiredRoles: UserRole[]): (req: Request, res: Response, next: NextFunction) => void {
        
        // The middleware returned by the method
        return (req: Request, res: Response, next: NextFunction) => {
            
            // 1. Checking Authentication
            // Retrieving user authentication data from the JWT
            const userAuthData = (req as any).authData; 
            
            if (!userAuthData || !userAuthData.privilege) {
                // If the user is not authenticated, respond with 401 Unauthorized
                throw new HttpError("Access denied, authentication required.", 401, true);
            }

            const userRole: UserRole = userAuthData.privilege; 

            // 2. Checking Authorization
            if (requiredRoles.includes(userRole)) {
                // Authorized
                next();
            } else {
                // 403 Forbidden : The user is authenticated but does not have the required privileges
                throw new HttpError("Access denied, your privilege rank does not grant you access to that ressource.", 403, true);
            }
        };
    }
    
    /** Generates a single identifier to track loggin attempts */
    public generateLogID(req: Request, res: Response, next: NextFunction): void {
        // Generate a unique log ID for the request
        const correlationId = randomUUID();
        // Append logId property to the request object
        (req as any).correlationId = correlationId; 
        res.setHeader('X-Request-ID', correlationId);
        next();
    }
}