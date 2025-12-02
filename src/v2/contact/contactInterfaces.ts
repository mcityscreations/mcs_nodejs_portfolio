export interface ICommunicator {
  /**
   * @param destinations An array containing the list of email addresses, phone numbers, or other destinations to send the message to.
   * @param text The content of the message.
   * @param subject The subject of the message (does not apply to SMS).
   */
  sendMessage(destinations: string | string[], text: string, subject: string): Promise<boolean>;
}

export abstract class CommunicatorBase implements ICommunicator {
    
    protected _transporter: any; // Placeholder for transporter 
    protected _contactMode: 'noreply' | 'sms' | 'newsletter' | 'support';
    protected _config: any;

    constructor(contactMode: 'noreply' | 'sms' | 'newsletter' | 'support') {
        this._contactMode = contactMode;
    }
    abstract instantiateTransporter(): void;

    public abstract sendMessage(destinations: string | string[], text: string, subject: string): Promise<boolean>;
}

export class EmailDto {
    public to!: string[];
    public subject!: string;
    public text!: string;
}