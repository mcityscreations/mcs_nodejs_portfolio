// src/v2/security/securityController.ts
/**
 * @description This SecurityController class defines the routes and handlers for security-related operations,
 * including user login and multi-factor authentication (MFA) processes.
 */
const express = require('express');
import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import { injectable } from "tsyringe";
import { AuthenticationFlowService } from "./authenticationFlowService";
import { AuthMiddlewares } from "./securityMiddlewares";
import { loginDTO, verifyMfaDTO } from "./securityValidators";
import { HttpError } from "../system/errorHandler/httpError";


@injectable()
export class SecurityController {

    public router: Router;

    constructor(
        private readonly _authenticationFlowService: AuthenticationFlowService,
        private readonly _authMiddlewares: AuthMiddlewares,
    ) {
        // Setting router
        this.router = express.Router();
        // Initializing routes
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.post('/login',
            this._authMiddlewares.generateLogID,
            loginDTO,
            this.login.bind(this)
        );
        this.router.post('/mfa/send',
            this._authMiddlewares.generateLogID,
            this.sendMfaCode.bind(this)
        );
        this.router.post('/mfa/verify',
            this._authMiddlewares.generateLogID,
            verifyMfaDTO,
            this.verifyMfaCode.bind(this)
        ); 
    }

    // Helper to extract common metadata from request
    private getRequestMetadata(req: Request) {
        const ipAddress = req.ip;
        if (!ipAddress) { throw new HttpError("Unable to determine IP address from request", 400, true); }

        const correlationId = (req as any).correlationId;
        if (!correlationId || typeof correlationId !== 'string') { throw new HttpError("Log ID is missing", 500, false); }

        const userAgent = req.headers['user-agent'] || 'Unknown/Missing';

        return { ipAddress, correlationId, userAgent };
    }

    public async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { ipAddress, correlationId, userAgent } = this.getRequestMetadata(req);

            const result = await this._authenticationFlowService.initiateLogin(
                req.body.username,
                req.body.password,
                req.body.recaptchaToken,
                ipAddress,
                correlationId,
                userAgent
            );

            res.status(result.statusCode).json(result.body);

        } catch (error) {
            next(error);
        }
    }

    public async sendMfaCode(req: Request, res: Response, next: NextFunction) {
        try {
            const { ipAddress, correlationId, userAgent } = this.getRequestMetadata(req);
            const { authSessionToken } = req.body; // Assurez-vous d'avoir un DTO pour cela!

            const result = await this._authenticationFlowService.sendMFACode(
                authSessionToken,
                ipAddress,
                correlationId,
                userAgent
            );

            res.status(200).json(result);

        } catch (error) {
            next(error);
        }
    }
    
    
    public async verifyMfaCode(req: Request, res: Response, next: NextFunction) {
        try {
            const { ipAddress, correlationId, userAgent } = this.getRequestMetadata(req);
            const { authSessionToken, otpCode } = req.body;

            const result = await this._authenticationFlowService.verifyMfaCode(
                authSessionToken,
                otpCode,
                ipAddress,
                correlationId,
                userAgent
            );

            res.status(200).json(result);

        } catch (error) {
            next(error);
        }
    }
}