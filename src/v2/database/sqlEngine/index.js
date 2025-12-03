// controllers/v2/database/sqlEngine

// Loading dependencies
const mysql = require('mysql');
const mariaDB = require('../dbCredentials');
const mSystem = require('../../system');

// Creating pool connections once
const defaultPool = mysql.createPool(mariaDB.getDatabaseCredentials());
const oauthPool = mysql.createPool(mariaDB.getOauthDBCredentials());

/**
 * Executes a SQL query.
 * @param {string} sqlRequest - The SQL query string.
 * @param {Array} params - Parameters for the SQL query.
 * @param {string} [requiredDatabase='standard'] - 'standard' or 'oauth' to choose the connection pool.
 * @param {boolean} [isEmptyResultAllowed=false] - If true, an empty result array won't trigger an error.
 * @param {mysql.PoolConnection} [transactionConnection=null] - Optional: A specific connection to use for a transaction.
 * @returns {Promise<Array<Object>>} A promise that resolves with the query results or rejects with an error.
 */
const execute = (sqlRequest, params = [], requiredDatabase = 'standard', isEmptyResultAllowed = false, transactionConnection = null) => {

    return new Promise((resolve, reject) => {
        // If a transaction connection is provided, use it directly
        // Otherwise, get a new connection from the pool
        const useExistingConnection = !!transactionConnection;
        const poolOrConnection = useExistingConnection ? transactionConnection : getPool(requiredDatabase);

        if (!poolOrConnection) {
            reject(mSystem.errorHandler("Database pool not initialized.", 500));
            return;
        }

        const acquireAndExecute = (conn) => {
            conn.query(sqlRequest, params, function (error, results, fields) {
                // IMPORTANT: Only release the connection if it was acquired for this single query (not a transaction)
                if (!useExistingConnection) {
                    conn.release();
                }

                if (error) {
                    console.error("SQL Error:", error); // Log the actual SQL error for debugging
                    if (error.errno === 1203) { // ER_TOO_MANY_USER_CONNECTIONS
                        reject(mSystem.errorHandler("Too many requests, try again later.", 503, true));
                    } else {
                        reject(mSystem.errorHandler("Database query failed.", 500)); // Generic DB error for client
                    }
                    return;
                } else if (results.length === 0 && !isEmptyResultAllowed) {
                    reject(mSystem.errorHandler("No data matching your request.", 404, true));
                    return;
                } else {
                    resolve(results);
                }
            });
        };

        if (useExistingConnection) {
            acquireAndExecute(poolOrConnection);
        } else {
            poolOrConnection.getConnection((err, connection) => {
                if (err) {
                    console.log(err);
                    reject(mSystem.errorHandler("Unable to connect to the database.", 503));
                    return;
                }
                acquireAndExecute(connection);
            });
        }
    });
};

/**
 * Begins a new transaction and returns the dedicated connection.
 * @param {string} [requiredDatabase='standard'] - 'standard' or 'oauth' to choose the connection pool.
 * @returns {Promise<mysql.PoolConnection>} A promise that resolves with the connection object for the transaction.
 */
const beginTransaction = (requiredDatabase = 'standard') => {
    return new Promise((resolve, reject) => {
        const pool = getPool(requiredDatabase);
        if (!pool) {
            reject(mSystem.errorHandler("Database pool not initialized.", 500));
            return;
        }
        pool.getConnection((err, connection) => {
            if (err) {
                reject(mSystem.errorHandler("Unable to get connection for transaction.", 503));
                return;
            }
            connection.beginTransaction(transactionErr => {
                if (transactionErr) {
                    connection.release();
                    reject(mSystem.errorHandler("Failed to begin transaction.", 500));
                } else {
                    resolve(connection); // Return the connection to be used for subsequent queries
                }
            });
        });
    });
};

/**
 * Commits an active transaction and releases the connection.
 * @param {mysql.PoolConnection} connection - The connection object returned by beginTransaction().
 * @returns {Promise<void>} A promise that resolves when the transaction is committed.
 */
const commit = (connection) => {
    return new Promise((resolve, reject) => {
        if (!connection) {
            reject(mSystem.errorHandler("No connection provided to commit.", 500));
            return;
        }
        connection.commit(err => {
            connection.release(); // Always release the connection after commit
            if (err) {
                reject(mSystem.errorHandler("Failed to commit transaction.", 500));
            } else {
                resolve();
            }
        });
    });
};

/**
 * Rolls back an active transaction and releases the connection.
 * @param {mysql.PoolConnection} connection - The connection object returned by beginTransaction().
 * @returns {Promise<void>} A promise that resolves when the transaction is rolled back.
 */
const rollback = (connection) => {
    return new Promise((resolve, reject) => {
        if (!connection) {
            reject(mSystem.errorHandler("No connection provided to rollback.", 500));
            return;
        }
        connection.rollback(() => { // Rollback usually doesn't error out, but we still release
            connection.release(); // Always release the connection after rollback
            resolve(); // Resolve even if rollback fails, but log the error
        });
    });
};

// Helper to get the correct pool
function getPool(dbName) {
    if (dbName === 'oauth') {
        return oauthPool;
    } else if (dbName === 'standard') {
        return defaultPool;
    }
    return defaultPool; // Default to standard
}

// Exporting the new methods
module.exports = {
    execute,
    beginTransaction,
    commit,
    rollback
};