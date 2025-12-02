// /controllers/v2/database/sqlEngine/index.d.ts

import { PoolConnection, Pool } from 'mysql';

// Declares the interface of the connection object that will be returned by beginTransaction
export interface TransactionConnection extends PoolConnection {}

// Declares the structure of the module exported by module.exports
declare const _exports: {
    execute(sqlRequest: string, params?: any[], requiredDatabase?: string, isEmptyResultAllowed?: boolean, transactionConnection?: TransactionConnection): Promise<any>;
    beginTransaction(requiredDatabase?: string): Promise<TransactionConnection>;
    commit(connection: TransactionConnection): Promise<void>;
    rollback(connection: TransactionConnection): Promise<void>;
};

export = _exports;