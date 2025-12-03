export type UserRole = 'ADMIN' | 'ARTIST' | 'CLIENT';

export interface ISecurityEvaluationResult {
  /** Indicates if a request can process to business logic */
  isAllowed: boolean;
  
  /** * If is allowed is false, indicates the required action to take
   * Ex: 'NONE', 'BLOCK', 'MFA_REQUIRED', 'CAPTCHA_REQUIRED'
   */
  requiredAction: 'NONE' | 'BLOCK' | 'MFA_REQUIRED' | 'CHALLENGE_REQUIRED'; 
}

export interface IOTPPayload {
    username: string;
    otp: string;
    expiresAt: number;
}

// Interface for the values stored in the MFA session (Redis)
export interface IMfaSessionData {
    username: string;
    privilege: string;
    mfa_validated: boolean;
    createdAt: number; // Timestamp
    otpCode: string | undefined;
    otpExpiresAt: number;
}

export class LoginDTO {
    public username!: string;
    public password!: string;
    public recaptchaToken!: string;
}

export class VerifyMfaDto {
    public authSessionToken!: string;
    public otpCode!: string;
}