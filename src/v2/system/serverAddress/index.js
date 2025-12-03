// get environment mode (dev or prod)
const environmentMode = require('../environment');

module.exports.defineHostname = () => {
    return {
        apiServer: function(){
            if (environmentMode.getEnvironment.mode === "dev"){
                var adminServerName="http://localhost:4000";
                return adminServerName;
            } else {
                var adminServerName="https://api.mcitys.com";
                return adminServerName;
            }
        },
        centralServer: function(){
            if (environmentMode.getEnvironment.mode === "dev"){
                var centralServerName = "http://localhost:3000";
                return centralServerName;
            } else {
                var centralServerName="https://www.mcitys.com";
                return centralServerName;
            }
        },
        mediaServer: function(){
            if (environmentMode.getEnvironment.mode === "dev"){
                var centralServerName = "http://localhost/mcitys/public_html";
                return centralServerName;
            } else {
                var centralServerName="https://media.mcitys.com";
                return centralServerName;
            }
        }
    }

}