/*
DOCUMENTATION
Input: string to convert, content must be sanitized prior to the invocation of this module.
Output: Converted string if resolved, error object otherwise.
*/

// Dependencies
const systemEnvironment = require('../../environment');

module.exports.convert = (stringToConvert) => {
    try {
        // Check if the incoming request is a string
        if (typeof stringToConvert === "string") {
            stringToConvert = stringToConvert.replace(/-/g," ");
            stringToConvert = stringToConvert.replace(/ /g,"-");
            stringToConvert = stringToConvert.replace(/,/g,"");
            stringToConvert = stringToConvert.replace(/\(/g,"");
            stringToConvert = stringToConvert.replace(/\)/g,"");
            stringToConvert = stringToConvert.replace(/\./g,"");
            stringToConvert = stringToConvert.replace(/'/g,"-");
            stringToConvert = stringToConvert.replace(/"/g,"-");
            stringToConvert = stringToConvert.replace(/&eacute;/g,"e");
            stringToConvert = stringToConvert.replace(/&Eacute;/g,"e");
            stringToConvert = stringToConvert.replace(/&egrave;/g,"e");
            stringToConvert = stringToConvert.replace(/&Egrave;/g,"e");
            stringToConvert = stringToConvert.replace(/&euml;/g,"e");
            stringToConvert = stringToConvert.replace(/&ecirc;/g,"e");
            stringToConvert = stringToConvert.replace(/&Ecirc;/g,"e");
            stringToConvert = stringToConvert.replace(/&ocirc;/g,"o");
            stringToConvert = stringToConvert.replace(/&ucirc;/g,"u"); 
            stringToConvert = stringToConvert.replace(/&icirc;/g,"i");
            stringToConvert = stringToConvert.replace(/&Icirc;/g,"i");
            stringToConvert = stringToConvert.replace(/&agrave;/g,"a");
            stringToConvert = stringToConvert.replace(/&Agrave;/g,"a");
            stringToConvert = stringToConvert.replace(/&acirc;/g,"a");
            stringToConvert = stringToConvert.replace(/&Acirc;/g,"a");
            stringToConvert = stringToConvert.replace(/&uuml;/g,"u");
            stringToConvert = stringToConvert.replace(/&ccedil;/g,"c");
            stringToConvert = stringToConvert.replace(/&Ccedil;/g,"c");
            stringToConvert = stringToConvert.replace(/&iuml;/g,"i");
            stringToConvert = stringToConvert.replace(/&Iuml;/g,"i");
            stringToConvert = stringToConvert.replace(/&#039;/g,"-");
            stringToConvert = stringToConvert.replace(/&comma;/g,"");
            stringToConvert = stringToConvert.replace(/&apos;/g,"-"); 
            stringToConvert = stringToConvert.replace(/&atilde;/g,"a");
            stringToConvert = stringToConvert.replace(/&ntilde;/g,"n");
            stringToConvert = stringToConvert.replace(/é/g,"e");
            stringToConvert = stringToConvert.replace(/è/g,"e");
            stringToConvert = stringToConvert.replace(/ê/g,"e");
            stringToConvert = stringToConvert.replace(/ë/g,"e");
            stringToConvert = stringToConvert.replace(/a/g,"a");
            stringToConvert = stringToConvert.replace(/ã/g,"a");
            stringToConvert = stringToConvert.replace(/à/g,"a");
            stringToConvert = stringToConvert.replace(/â/g,"a");
            stringToConvert = stringToConvert.replace(/ä/g,"a");
            stringToConvert = stringToConvert.replace(/o/g,"o");
            stringToConvert = stringToConvert.replace(/ô/g,"o");
            stringToConvert = stringToConvert.replace(/ö/g,"o");
            stringToConvert = stringToConvert.replace(/ü/g,"u");
            stringToConvert = stringToConvert.replace(/ï/g,"i");
            stringToConvert = stringToConvert.replace(/î/g,"i");
            stringToConvert = stringToConvert.replace(/ñ/g,"n");
            stringToConvert = stringToConvert.replace(/ç/g,"c");
            
            stringToConvert = stringToConvert.toLowerCase();
            return stringToConvert;
        } else {
            // if dev environment, send detailed data
            if (systemEnvironment.getEnvironment.mode === 'dev') {
                const errorObject = {
                    message: 'Incoming request must be a string.'+ typeof stringToConvert + ' given.',
                    code: 'STRINGURIENCODER'
                }
                throw errorObject;
            // Otherwise send an error 500
            } else {
                const errorObject = {
                    message: "Error 500",
                    code: "ERROR500"
                }
                throw errorObject;
            }
        }
    } catch (error) {
        return error
    }
        
    
    

    
}