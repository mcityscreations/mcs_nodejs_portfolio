// controllers/v2/contact/contactService.ts
/**
 * @description This ContactService class provides high-level methods to send emails and SMS messages.
 * It utilizes specific communicators for each type of message (EmailCommunicator and SMSCommunicator).
 */
import { EmailCommunicator } from './emailCommunicator';
import { SMSCommunicator } from './smsCommunicator';
import { HttpError } from '../system/errorHandler/httpError';

export class ContactService {
    
    private _smsCommunicator: SMSCommunicator | null = null;
    private _noreplyCommunicator: EmailCommunicator | null = null;

    constructor() {}

    public async sendNoreplyEmail(to: string[], subject: string, body: string): Promise<void> {
        // Initialize EmailCommunicator for 'noreply'
        if (!this._noreplyCommunicator) {
            this._noreplyCommunicator = new EmailCommunicator('noreply');
        }
        
        const success = await this._noreplyCommunicator.sendMessage(
 
            to, 
            body, 
            subject
        );

        if (success) {
            console.log(`Email 'noreply' successfully sent to ${to} with subject "${subject}".`);
        } else {
            throw new HttpError('Failed to send noreply email.', 500);
        }
    }

    public async sendSMS(to: string[], message: string): Promise<void> {
        // Initialize SMSCommunicator
        if (!this._smsCommunicator) {
            this._smsCommunicator = new SMSCommunicator();
        }
        const success = await this._smsCommunicator.sendMessage(
            to, 
            message, 
            '' // No subject for SMS
        );  
        if (success) {
            console.log(`SMS successfully sent to ${to}.`);
        } else {
            throw new HttpError('Failed to send noreply sms.', 500);
        }
    }

}