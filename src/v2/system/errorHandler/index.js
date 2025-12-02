/**
 * @module errorHandler
 * @description This is the centralized error handler of the Mcitys API.
 * It delivers standard responses and logs every error.
 *
 * @param {string} message
 * @param {number | undefined} code
 * If set to TRUE the original message sent by the caller module is transmitted uncrypted to the client.
 * @param {boolean | undefined} isMessagePublic
 * @returns {errorObject: {message: string, code: number}}
 */
const environment = require('../environment');
const httpCodes = require('./httpErrorcodes');
module.exports.handle = (message, code, isMessagePublic) => {
    // Generate a call stack for the given error
    const { stack } = new Error(message);
    const isDev = environment.getEnvironment.mode === 'dev';
    const isPublic = message.isMessagePublic || isMessagePublic || false;
    console.log(stack);
    // If an error object is given through the first parameter, get the message property it contains.
    // Otherwise get the string message provided
    const msg = message.message ? message.message : message;
    // If an error object is transmitted through the first parameter, get the code property it contains.
    // Otherwise get the code parameter or set the code to 500 if the parameter is undefined
    const errCode = message.code || code || 500;
    if (isPublic) {
        return {
            message: msg,
            code: errCode
        };
    }
    else {
        if (isDev) {
            return {
                message: msg,
                code: errCode
            };
        }
        else {
            return {
                message: httpCodes.httpCodes[errCode] || httpCodes.httpCodes[500],
                code: errCode
            };
        }
    }
};