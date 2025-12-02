export type UserRole = 'ADMIN' | 'ARTIST' | 'CLIENT';

export interface ISecurityEvaluationResult {
  /** Indique si la requête peut continuer vers la logique métier. */
  isAllowed: boolean;
  
  /** * Le type de défi requis, si isAllowed est false.
   * Ex: 'NONE', 'BLOCK', 'MFA_REQUIRED', 'CAPTCHA_REQUIRED'
   */
  requiredAction: 'NONE' | 'BLOCK' | 'MFA_REQUIRED' | 'CHALLENGE_REQUIRED'; 
}

export interface IOTPPayload {
    username: string;
    otp: string;       // Changé à string pour garantir le format 6 chiffres
    expiresAt: number;   // Stocke la date/heure exacte d'expiration
}

// Interface pour la valeur stockée dans Redis
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
    public authSessionToken!: string; // Jeton de session MFA
    public otpCode!: string;          // Le code à 6 chiffres
}