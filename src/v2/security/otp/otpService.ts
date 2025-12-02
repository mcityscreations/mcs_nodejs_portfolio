import { injectable } from 'tsyringe';
import { HttpError } from "../../system/errorHandler/httpError";
import { IOTPPayload } from "../securityInterface";
import { UsersRepository } from "../../users/usersRepository";
import { ContactService } from "../../contact/contactService";

// TTL (Time To Live) for OTP in minutes
const OTP_TTL_SECONDS = 5*60; // 5 minutes

@injectable()
export class OtpService {
    
    constructor(
        private readonly _userRepository: UsersRepository,
        private readonly _contactService: ContactService,
    ) {}

    public generateOTP(username: string): IOTPPayload {
        // Checking username
        if (!username || username === "") {
            throw new HttpError("A username must be provided to generate an OTP", 400, true);
        }

        // Generate a 6-digit OTP
        // PadStart ensures leading zeros are included
        const otpCode = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

        // Calculating expiry time
        const now = new Date();
        const expiresAt = new Date(now.getTime() + OTP_TTL_SECONDS * 60 * 1000);
        
        return {username: username, otp: otpCode, expiresAt: expiresAt.getTime()};
    }

    public async sendMFACode(otpPayload: IOTPPayload): Promise<void> {
        // Retrieving user's phone number
        const userContact = await this._userRepository.getUserContactInfo(otpPayload.username);
        
        if (!userContact || !userContact.phoneNumber) {
            throw new HttpError("Invalid request or user configuration.", 403, true); 
        }
        
        const phoneNumber = userContact.phoneNumber;

        // Sending message
        const message = `MCITYS - Your security code is: ${otpPayload.otp}. It expires in ${OTP_TTL_SECONDS/60} minutes.`;
        await this._contactService.sendSMS([phoneNumber], message);
    }

}