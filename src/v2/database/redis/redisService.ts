import Redis, { Redis as RedisClient } from 'ioredis';
import { HttpError } from '../../system/errorHandler/httpError';
import { injectable } from 'tsyringe';

@injectable()
export class RedisService {
    private readonly _client: RedisClient;
    private readonly _host: string;
    private readonly _port: number;
    private readonly _password?: string;

    constructor() {
        // 1. Validating configuration from environment variables
        this._host = process.env.REDIS_HOST || '127.0.0.1'; // Default to localhost
        this._port = parseInt(process.env.REDIS_PORT || '6379', 10);
        this._password = process.env.REDIS_PASSWORD;

        // 2. Creating Redis client instance
        this._client = new Redis({
            host: this._host,
            port: this._port,
            password: this._password,
            // Other connection options
            retryStrategy: times => {
                // Try to reconnect for 10 seconds max
                const delay = Math.min(times * 50, 2000);
                if (times > 50) return null; // Stops after 50 attempts (~10 seconds)
                return delay;
            }
        });

        // 3. Connection event handlers
        this._client.on('error', (error) => {
            // Logging error, no HttpError here as we are outside request context
            console.error('Redis connection error:', error.message);
        });

        this._client.on('connect', () => {
            console.log(`Redis connected successfully to ${this._host}:${this._port}`);
        });
    }

    /**
     * Returns the underlying Redis client instance
     * that enables repositories to perform operations.
     */
    public getClient(): RedisClient {
        return this._client;
    }

    // Basic methods that encapsulate error handling

    /** Setting a key with a value and a TTL */
    public async setWithTTL(key: string, value: string, ttlSeconds: number): Promise<void> {
        try {
            await this._client.set(key, value, 'EX', ttlSeconds);
        } catch (error) {
            console.error(`Redis SET error for key ${key}:`, error);
            throw new HttpError('Redis service is unavailable.', 503, false);
        }
    }

    /** Returns the value associated to a given key */
    public async get(key: string): Promise<string | null> {
        try {
            return await this._client.get(key);
        } catch (error) {
            console.error(`Redis GET error for key ${key}:`, error);
            throw new HttpError('Redis service is unavailable.', 503, false);
        }
    }
    
    /** Deletes a key */
    public async del(key: string): Promise<void> {
        try {
            await this._client.del(key);
        } catch (error) {
            console.error(`Redis DEL error for key ${key}:`, error);
            throw new HttpError('Redis service is unavailable.', 503, false);
        }
    }
}