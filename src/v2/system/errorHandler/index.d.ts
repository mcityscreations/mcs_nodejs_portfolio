// /controllers/v2/system/errorHandler/index.d.ts

    /**
     * @description This is the centralized error handler of the Mcitys API.
     * It delivers standard responses and logs every error.
     *
     * @param message The error message (can be a string or an object with message/code/isMessagePublic).
     * @param code The HTTP error code. Defaults to 500 if not provided.
     * @param isMessagePublic If true, the original message is transmitted to the client.
     * @returns An object containing the error message and code.
     */

export interface ErrorObject {
    message: string;
    code: number;
}

export interface MessageParamObject {
    message?: string;
    code?: number;
    isMessagePublic?: boolean;
}

export function handle(
        message: MessageParamObject | string,
        code?: number,
        isMessagePublic?: boolean,
    ):ErrorObject;
