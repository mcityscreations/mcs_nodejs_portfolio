module.exports.getResults = () => {
    // Load dependencies
    const sqlEngine = require('../../../database/sqlEngine');

    //Get languages list
    return new Promise(function(resolve, reject) {
        const sqlRequest = 'SELECT mcs_languages.id_language, mcs_languages.title FROM mcs_languages';
        sqlEngine.execute(sqlRequest)
        .then(result => {
            resolve(result);
        })
        .catch(error => {
            reject(error);
        })
    });
}