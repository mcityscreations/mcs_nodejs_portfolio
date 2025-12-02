// controllers/v2/contact/smsCommunicator.ts
/**
 * @description This class handles SMS communication using the OVH SMS API.
 * It extends the CommunicatorBase class and implements the sendMessage method specific to SMS.
 */
const ovh = require('ovh');
import { CommunicatorBase } from './contactInterfaces'; 
import { ContactConfig } from "./contactConfig";
import { HttpError } from '../system/errorHandler/httpError';

export class SMSCommunicator extends CommunicatorBase {
    
    private ovhConfig: any; 

    constructor() {
        super('sms')
        this.ovhConfig = ContactConfig.getConfig('noreply', 'sms'); 
        this.instantiateTransporter(); // Instantiating the OVH transporter on initialization
    }

    instantiateTransporter(): void {
        // Checking OVH configuration keys
        if (!this.ovhConfig.appKey || !this.ovhConfig.appSecret || !this.ovhConfig.consumerKey) {
            throw new HttpError("OVH configuration keys (appKey, appSecret, consumerKey) must be provided in ContactConfig.", 500, false);
        }
        
        if (!this._transporter) {
            this._transporter = ovh({
                appKey: this.ovhConfig.appKey,
                appSecret: this.ovhConfig.appSecret,
                consumerKey: this.ovhConfig.consumerKey,
            });
        }
    }

    private ovhRequest(method: string, path: string, params: any = {}): Promise<any> {
        return new Promise((resolve, reject) => {
            // Le client OVH (this._transporter) attend la fonction de callback
            this._transporter.request(method, path, params, (err: any, result: any) => {
                if (err) {
                    // Si une erreur survient, rejeter la Promise
                    return reject(err); 
                }
                // Sinon, résoudre la Promise avec le résultat
                resolve(result);
            });
        });
    }

    public async sendMessage(destination: string | Array<string>, text: string, subject: string): Promise<boolean> {
        
        if (!destination) throw new HttpError("Destination phone number must be provided", 400, true);
        if (!text) throw new HttpError("SMS body text must be provided", 400, true);
        
        try {
            // STEP 1: Find the serviceName (the address /sms retreives the list of service names)
            const serviceNames: string[] = await this.ovhRequest('GET', '/sms');

            if (serviceNames.length === 0) {
                throw new HttpError("No SMS service name found on OVH account.", 500, false);
            }
            
            // Retreiving the first service name
            const serviceName = serviceNames[0]; 

            // Handling destination as string or array
            if (Array.isArray(destination)) {
                if (destination.length === 0) {
                    throw new HttpError("Destination phone number array is empty.", 400, true);
                }
            }


            // STEP 2: Send the SMS using the serviceName
            const result = await this.ovhRequest('POST', `/sms/${serviceName}/jobs`, {
                message: text,
                senderForResponse: this.ovhConfig.senderForResponse || true,
                receivers: [destination] // An array of destination numbers
            });

            // La réponse en cas de succès peut varier, mais si nous arrivons ici, c'est réussi
            console.log(`SMS successfully sent to ${destination} via OVH. Job ID: ${result.jobId}`);
            return true; 
            
        } catch (error: any) {
            console.error(`Error sending SMS to ${destination}:`, error);
            // Lancer une nouvelle erreur pour la gestion par le service appelant
            const errorMessage = error.message || error.toString();
            throw new HttpError(`OVH SMS sending failed: ${errorMessage}`, 500, false); 
        }
    }
}