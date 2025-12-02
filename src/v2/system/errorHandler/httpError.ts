// /controllers/v2/system/errorHandler/httpError.ts 

export class HttpError extends Error {
    public readonly statusCode: number;
    public readonly isMessagePublic: boolean;

    constructor(message: string, statusCode: number, isMessagePublic: boolean = false) {
        super(message);
        this.statusCode = statusCode;
        this.isMessagePublic = isMessagePublic;
        this.name = 'HttpError'; 
        
        // Maintien de la stack trace, essentiel en Node/JS
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, HttpError);
        }
    }
}
