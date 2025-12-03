import { injectable } from "tsyringe";
import { execute } from "../database/sqlEngine";
import { RedisService } from "../database/redis/redisService";
import { IWeatherData } from "./weatherInterfaces";

@injectable()
export class WeatherRepository {

    private readonly KEY_PREFIX = 'weather:';
    constructor(private readonly _redisService: RedisService){}

    /**
     * Retrieves last hour result from Redis
     * @param locationKey // the location name
     */
    public async getLast(locationKey: string): Promise<IWeatherData | null> {
        // Building complete key
        const key = this.KEY_PREFIX + locationKey; 
        
        // Retrieving data
        const jsonString = await this._redisService.get(key); 

        // If no data, return null
        if (!jsonString) {
            return null;
        }

        try {
            // Parsing data
            return JSON.parse(jsonString) as IWeatherData;
        } catch (e) {
            console.error(`Erreur de parsing des données Redis pour la clé ${key}:`, e);
            // Deleting corrupted data
            await this._redisService.del(key); 
            return null;
        }
    }

    public async getLast24H(){
        const sqlRequest = `SELECT 
            DATE_FORMAT(input_date, \'%d.%m.%Y %H.%i\') AS date, 
            pressure, 
            temperature, 
            humidity,  
            weather_score 
            FROM mcs_weather_data 
            ORDER BY input_date 
            DESC
            LIMIT 24`;
        const results = await execute(sqlRequest, [], 'standard', true);
        return results;
    }

    /**
     * Stores weather data in Redis
     * @param locationKey // the name of the location
     * @param weatherData // weather data
     */
    public async setWeather(locationKey: string, weatherData: IWeatherData, ttlSeconds: number){
        const key = this.KEY_PREFIX + locationKey;
        const jsonString = JSON.stringify(weatherData);
        await this._redisService.setWithTTL(key, jsonString, ttlSeconds)
    }

    public async setWeatherInMariadb(weatherData: IWeatherData, ip_sender: string){
        const sqlRequest = `INSERT INTO mcs_weather_data 
        (input_date, pressure, temperature, humidity, ip_sender, weather_score) 
        VALUES (?, ?, ?, ?, ?, ?)`;
        const params = [
            weatherData.date, 
            weatherData.pressure, 
            weatherData.temperature, 
            weatherData.humidity, 
            ip_sender, 
            weatherData.weather_score
        ];
        await execute(sqlRequest, params, 'standard');
    }
}