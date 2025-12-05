const { HttpError } = require('../../system/errorHandler/httpError');

module.exports.getDatabaseCredentials = () => {

        const host = process.env.MARIADB_MAIN_HOST || 'localhost';
        const rawPort = process.env.MARIADB_MAIN_PORT || '3307';
        const user = process.env.MARIADB_MAIN_USER || '';
        const password = process.env.MARIADB_MAIN_PASSWORD || '';
        const database = process.env.MARIADB_MAIN_DATABASE || '';

        const port = parseInt(rawPort, 10);
    
        if (!user || !database || isNaN(port)) { throw new HttpError('Unable to load database credentials', 500, false); }
        return {
            host     : host,
            port     : port,
            user     : user,
            password : password,
            database : database  
        }

}

module.exports.getOauthDBCredentials = () => {
    const host = process.env.MARIADB_SECURITY_HOST || 'localhost';
    const rawPort = process.env.MARIADB_SECURITY_PORT || '3307';
    const user = process.env.MARIADB_SECURITY_USER || '';
    const password = process.env.MARIADB_SECURITY_PASSWORD || '';
    const database = process.env.MARIADB_SECURITY_DATABASE || '';

    const port = parseInt(rawPort, 10);

    if (!user || !database || isNaN(port)) { throw new HttpError('Unable to load database credentials', 500, false); }
    return {
        host     : host,
        port     : port,
        user     : user,
        password : password,
        database : database  
    }
}