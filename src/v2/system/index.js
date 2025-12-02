/** SYSTEM CORE MODULE */


const errorModule = require('./errorHandler');
const successModule = require('./successResponseHandler');
const languagesModule = require('./languages');
const serverAddressesModule = require('./serverAddress');
const uriFormatModule = require('./uriFormat/encodeStringsToURIStandard');
const environment = require('./environment');
const scriptsAddresses = require('./scriptsAddresses');
const linkGenerator = require('./linksGenerator/getLinkFromItemID');


module.exports.errorHandler = (message, erroCode) => {
    return errorModule.handle(message, erroCode);
}

module.exports.successRes = (successMessage, successCode) => {
    return successModule.handle(successMessage, successCode);
}

module.exports.languages = languagesModule;

module.exports.serverAddresses = serverAddressesModule;

module.exports.uriFormat = uriFormatModule;

module.exports.environment = environment.getEnvironment.mode;

module.exports.scriptsAddresses = scriptsAddresses.get;

module.exports.linkGenerator = linkGenerator;

