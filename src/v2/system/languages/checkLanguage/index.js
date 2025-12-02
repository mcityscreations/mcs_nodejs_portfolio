module.exports.getResults = (languageSubmitted) => {
        //Load dependencies
        const entities = require('entities');
        const sqlEngine = require('../../../database/sqlEngine');
        const systemEnvironment = require('../../environment');
        

        //Handling submitted variable
        languageSubmitted = entities.encodeHTML(languageSubmitted);
        
        return new Promise(function(resolve, reject){
            try {
                const sqlRequest = 'SELECT COUNT(*) FROM mcs_languages WHERE mcs_languages.id_language = ?';
                const sqlParams = [languageSubmitted];
                sqlEngine.execute(sqlRequest, sqlParams)
                .then(result => {
                    if(result[0]['COUNT(*)'] !== 1) {
                        if (systemEnvironment.getEnvironment.mode === 'dev') {
                            const errorObject = {
                                message: "Unkown language",
                                code: "CHECKLANGUAGE-UNKOWNLALNGUAGE"
                            }
                            reject(errorObject);
                        // Otherwise send an error 500
                        } else {
                            const errorObject = {
                                message: "Error 500",
                                code: "ERROR500"
                            }
                            reject(errorObject);
                        }
                    } else {
                        resolve();
                    }
                })
            } catch {
                if (systemEnvironment.getEnvironment.mode === 'dev') {
                    const errorObject = {
                        message: "Unkown language",
                        code: "CHECKLANGUAGE-UNKOWNLALNGUAGE"
                    }
                    reject(errorObject);
                // Otherwise send an error 500
                } else {
                    const errorObject = {
                        message: "Error 500",
                        code: "ERROR500"
                    }
                    reject(errorObject);
                }
            }

        })
}