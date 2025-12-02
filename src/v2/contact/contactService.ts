// controllers/v2/contact/contactService.ts
/**
 * @description This ContactService class provides high-level methods to send emails and SMS messages.
 * It utilizes specific communicators for each type of message (EmailCommunicator and SMSCommunicator).
 */
import { EmailCommunicator } from './emailCommunicator';
import { SMSCommunicator } from './smsCommunicator';

export class ContactService {
    
    private _smsCommunicator: SMSCommunicator | null = null;
    private _noreplyCommunicator: EmailCommunicator | null = null;

    constructor() {}

    public async sendNoreplyEmail(to: string[], subject: string, body: string): Promise<void> {
        
        // Initialiser le communicateur s'il n'est pas déjà fait
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
            // L'erreur de l'échec est déjà levée par sendMessage, donc on ne devrait jamais arriver ici 
            // si une erreur est levée. Ce bloc est pour une logique de succès ou d'échec non levée.
        }
    }

    public async sendSMS(to: string[], message: string): Promise<void> {
        // Initialiser le communicateur SMS s'il n'est pas déjà fait
        if (!this._smsCommunicator) {
            this._smsCommunicator = new SMSCommunicator();
        }
        const success = await this._smsCommunicator.sendMessage(
            to, 
            message, 
            '' // Sujet non applicable pour SMS
        );  
        if (success) {
            console.log(`SMS successfully sent to ${to}.`);
        } else {
            // L'erreur de l'échec est déjà levée par sendMessage, donc on ne devrait jamais arriver ici 
            // si une erreur est levée. Ce bloc est pour une logique de succès ou d'échec non levée.
        }
    }

}