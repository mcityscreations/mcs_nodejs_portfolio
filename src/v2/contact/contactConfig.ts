import { HttpError } from "../system/errorHandler/httpError";

type CommunicationChannel = 'email' | 'sms';

export const ContactConfig = {
    // The method 'getConfig' is only called when the .env config is enabled.
    getConfig: (mode: 'noreply' | 'newsletter' | 'support', channel: CommunicationChannel) => {
        if (channel === 'email') {
            // Common email configuration
            const config = {
                host: process.env.COMMON_EMAIL_HOST || "mail.mcitys.com",
                port: process.env.COMMON_EMAIL_PORT ? parseInt(process.env.COMMON_EMAIL_PORT) : 465,
                secure: process.env.COMMON_EMAIL_SECURE === 'true',
            };
            // Retrieve user and pass based on mode
            const userKey = `${mode.toUpperCase()}_EMAIL_USER`;
            const passKey = `${mode.toUpperCase()}_EMAIL_PASS`;
            
            const user = process.env[userKey];
            const pass = process.env[passKey];
            // Validate presence
            if (!user || !pass) {
                throw new HttpError(`Missing credentials for the mode: ${mode} in .env`, 500, false);
            }
            // Return full config
            switch (mode) {
                case 'noreply':
                case 'newsletter':
                case 'support':
                    return {
                        ...config,
                        auth: { user, pass }
                    }; 
                default:
                    throw new HttpError(`No credentials provided for the mode: ${mode}`, 500, false);
            }

        } else if (channel === 'sms') {
            const provider = process.env.SMS_PROVIDER; 

            if (provider && provider === 'OVH') {
                const ovhConfig = {
                    provider: 'OVH',
                    appID: process.env.OVH_APPLICATION_KEY,
                    appSecret: process.env.OVH_APPLICATION_SECRET,
                    consumerKey: process.env.OVH_CONSUMER_KEY,
                };
                if (!ovhConfig.appID || !ovhConfig.appSecret || !ovhConfig.consumerKey) {
                    throw new HttpError("OVH API keys are missing (KEY/SECRET/CONSUMER) in .env", 500, false);
                }
                return ovhConfig;
            } else {
                throw new HttpError(`SMS provider missing or not supported ${provider}`, 500, false);
            }
        } else {
            throw new HttpError(`Communication channel not supported: ${channel}`, 500, false);
        }
    }
};