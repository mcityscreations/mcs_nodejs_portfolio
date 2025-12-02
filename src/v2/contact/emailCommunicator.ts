// controllers/v2/contact/emailCommunicator.ts
/**
 * @description This class handles Email communication using nodemailer.
 * It extends the CommunicatorBase class and implements the sendMessage method specific to Email.
 */
import { HttpError } from "../system/errorHandler/httpError";
import nodemailer from "nodemailer";
import { CommunicatorBase } from "./contactInterfaces";
import { ContactConfig } from "./contactConfig";
import { validateEmailMessage } from "./contactValidator";


export class EmailCommunicator extends CommunicatorBase {
    
    private _transporterConfig: any; 
    private readonly senderAddress: string;

    constructor(mode: 'noreply' | 'newsletter' | 'support') {
        super(mode);
        const config = ContactConfig.getConfig(mode, 'email');
        this._transporterConfig = config; 
        
        // Storing sender address from config
        if ('auth' in config && config.auth) {
            this.senderAddress = config.auth.user;
        } else {
            throw new HttpError("Email configuration incomplete : 'auth' or 'user' missing.", 500, false);
        }
        // Instantiating transporter on initialization
        this.instantiateTransporter();
    }

    instantiateTransporter(): void {
        console.log(`Instantiating transporter for mode: ${this._contactMode}`);
        if (!this._transporter) {
            this._transporter = nodemailer.createTransport(this._transporterConfig as nodemailer.TransportOptions);
        }
    }

    public async sendMessage(destinations: string | string[], text: string, subject: string): Promise<boolean> {
        // Transform destinations param into an array if necessary
        const destinationsArray = Array.isArray(destinations) ? destinations : [destinations];
        
        // Trim incoming params
        const trimmedSubject = subject.trim();
        const trimmedText = text.trim();

        // Validate data (if validation fails, it throws an HttpError)
        validateEmailMessage({destinations: destinationsArray, trimmedText: trimmedText, trimmedSubject});

        try {
            if (!this._transporter) {
                throw new HttpError("Email transporter is not instantiated.", 500, false);
            }

            const mailOptions = {
                from: this.senderAddress,
                to: destinationsArray,
                subject: trimmedSubject,
                text: trimmedText,
            };

            await this._transporter.sendMail(mailOptions);
            
            console.log(`Email successfully sent to ${destinationsArray} via mode ${this._contactMode}.`);
            return true; 
        } catch (error: any) {
            console.error(`Error sending email to ${destinationsArray}:`, error);
            throw new HttpError(`Email sending failed for mode ${this._contactMode}: ${error.message}`, 500, false); 
        }
    }
}