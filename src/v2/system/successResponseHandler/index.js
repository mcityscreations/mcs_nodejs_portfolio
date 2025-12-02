/**
 * SUCCESS RESPONSE HANDLER MODULE
 * Generates error objects to avoid multiple repetitions inside of the code
 * @param successMessage
 * @param successCode
 */

module.exports.handle = (successMessage, successCode) => {
    const successObject = {
        message: successMessage,
        code: successCode
    }
    return successObject;
}