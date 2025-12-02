/**
 * LANGUAGES CORE MODULE
 * 
 */

const checkLanguages = require('./checkLanguage');
const getLanguagesList = require('./getList');

module.exports.check = () => {
    return checkLanguages.getResults();
}

module.exports.getList = () => {
    return getLanguagesList.getResults();
}
