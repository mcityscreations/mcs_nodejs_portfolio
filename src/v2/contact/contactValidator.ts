// controllers/v2/contact/contactValidator.ts

import { HttpError } from "../system/errorHandler/httpError";
import { Request, Response, NextFunction } from "express";

// Validator configs
const MAX_RECIPIENTS = 50; 
const MAX_SUBJECT_LENGTH = 255;
const MAX_TEXT_LENGTH = 10000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 

interface IEmailValidationPayload {
    destinations: string[];
    trimmedSubject: string;
    trimmedText: string;
}

/**
 * Function that checks if an email address is valid.
 * @param email The email address to check
 */
export function isValidEmail(email: string): boolean {
    return EMAIL_REGEX.test(email);
}

/**
 * This function checks all the params required to send a message.
 * @param payload The object containing all the params to send a message.
 */
export function validateEmailMessage(payload: IEmailValidationPayload): void {
    const { destinations, trimmedSubject, trimmedText } = payload;
    
    // 1. Are there any destinations missing ?
    if (destinations.length === 0 || destinations.some(d => !d)) {
        throw new HttpError("Destination(s) email address must be provided.", 400, true);
    }
    
    // 2. Validate email formats
    if (destinations.some(d => !isValidEmail(d))) {
        throw new HttpError("One or more email addresses have a wrong format.", 400, true);
    }

    // 3. Validating the number of recipients
    if (destinations.length > MAX_RECIPIENTS) {
        throw new HttpError(`The number of recipients exceeds the limit of ${MAX_RECIPIENTS}.`, 400, true);
    }
    // 4. Validate subject content and length to avoid DoS attacks
    if (trimmedSubject.length === 0) {
        throw new HttpError("Email subject must be provided.", 400, true);
    }
    if (trimmedSubject.length > MAX_SUBJECT_LENGTH) {
        throw new HttpError(`The subject exceeds the limit of ${MAX_SUBJECT_LENGTH} characters.`, 400, true);
    }
    // 5. Validate text content and length to avoid DoS attacks
    if (trimmedText.length === 0) {
        throw new HttpError("Email body text must be provided.", 400, true);
    }
    if (trimmedText.length > MAX_TEXT_LENGTH) {
        throw new HttpError(`The email body text exceeds the maximum length authorized`, 400, true)
    }
}

/** This middleware checks that raw data transmitted by the user have a specific structure */
export function emailDTO(req: Request, res: Response, next: NextFunction): void {

    // Checking that body exists and has required fields
    if (!req.body) {
        throw new HttpError("Request body is missing.", 400, true);
    }
    const { to, subject, text } = req.body;

    // Checking that fields are not undefined or null
    if (!to || !subject || !text) {
        throw new HttpError("Missing required fields: 'to', 'subject', or 'text'.", 400, true);
    }
    
    // Type checking
    // 1. 'to' must be an array of strings
    if (!Array.isArray(to) ) {
        throw new HttpError("'to' must be an array of email addresses.", 400, true);
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (to.some((email: any) => typeof email !== 'string' || email.trim() === '' || !emailRegex.test(email))) {
        throw new HttpError("All elements in 'to' must be valid, non-empty email strings.", 400, true);
    }
    // 2. 'subject' and 'text' must be strings
    if (typeof subject !== 'string' || typeof text !== 'string') {
        throw new HttpError("'subject' and 'text' must be strings.", 400, true);
    }

    next();
}