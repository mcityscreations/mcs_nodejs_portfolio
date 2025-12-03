/** SYSTEM CORE MODULE */


const errorModule = require('./errorHandler');
const languagesModule = require('./languages');
const serverAddressesModule = require('./serverAddress');
const uriFormatModule = require('./uriFormat/encodeStringsToURIStandard');
const environment = require('./environment');
const linkGenerator = require('./linksGenerator/getLinkFromItemID');


module.exports.errorHandler = (message, erroCode) => {
    return errorModule.handle(message, erroCode);
}

module.exports.languages = languagesModule;

module.exports.serverAddresses = serverAddressesModule;

module.exports.uriFormat = uriFormatModule;

module.exports.environment = environment.getEnvironment.mode;

module.exports.linkGenerator = linkGenerator;

