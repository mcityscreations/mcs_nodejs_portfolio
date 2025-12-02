import { Request, Response, NextFunction } from "express";
import { HttpError } from "../system/errorHandler/httpError";
import { LoginDTO } from "./securityInterface";


export function loginDTO(req: Request, res: Response, next: NextFunction): void {

    // Checking that body exists
    if (!req.body) {
        throw new HttpError("Request body is missing.", 400, true);
    }
    const body = req.body;

    // Defining required fields using the loginDTO class
    const requiredFields: (keyof LoginDTO)[] = ['username', 'password', 'recaptchaToken'];

    // Checking the presence and type of each required field
    for (const field of requiredFields) {
        if (typeof body[field] !== 'string' || body[field].trim() === '') {
            throw new HttpError(`Le champ '${field}' est manquant ou invalide.`, 400, true);
        }
    }

    // Applying the loginDTO interface to req.body
    req.body = req.body as LoginDTO;
    
    next();
}

    

export function verifyMfaDTO(req: Request, res: Response, next: NextFunction): void {
    if (!req.body || typeof req.body.authSessionToken !== 'string' || typeof req.body.otpCode !== 'string' || req.body.otpCode.trim() === '') {
        throw new HttpError("Missing or invalid 'authSessionToken' or 'otpCode'.", 400, true);
    }
    // Vérification de la longueur du code OTP (ex: 6 chiffres)
    if (req.body.otpCode.length !== 6 || !/^\d+$/.test(req.body.otpCode)) {
         throw new HttpError("Le code OTP doit être composé de 6 chiffres.", 400, true);
    }
    next();
}