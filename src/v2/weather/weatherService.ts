import { injectable } from "tsyringe";
import { WeatherScorePayloadSchema, IWeatherScorePayload } from "./weatherValidators";
import { HttpError } from "../system/errorHandler/httpError";
import { OpenWeatherProvider } from "./openWeatherProvider";
import { IWeatherData } from "./weatherInterfaces";
import { WeatherRepository } from "./weatherRepository";

@injectable()
export class WeatherService {
    private readonly MARSEILLE_LAT = 43.295;
    private readonly MARSEILLE_LONG = 5.372;

    constructor(
        private readonly _openWeatherProvider: OpenWeatherProvider,
        private readonly _weatherRepository: WeatherRepository,
    ){}

    public async getLast24h(){
        try {
            const weatherData = await this._weatherRepository.getLast24H();
            if (weatherData.length == 0) throw new HttpError('No weather data provided', 204, true);
            return weatherData;
        } catch (error) {
            throw error;
        }
    }

    public async getLastHour() {
        try {
            const weatherData = await this._weatherRepository.getLast('marseille');
            if (!weatherData) throw new HttpError('Unable to load weather data', 500, false);
            return weatherData;
        } catch (error) {
            throw error;
        }
    }

    public async setWeather() {
        try {
            // 1. Make API call
            const weatherData: IWeatherData = await this._openWeatherProvider.getCurrentWeather(this.MARSEILLE_LAT, this.MARSEILLE_LONG, {
                exclude: ['minutely','hourly','daily','alerts'],
                units: 'metric'
            });
            // 2. Calculate weather score
            const weatherScore = this.getWeatherScore({pressure: weatherData.pressure, humidity: weatherData.humidity});
            weatherData.weather_score = weatherScore;
            // 3. Save into Redis
            await this._weatherRepository.setWeather('marseille', weatherData, 6650);
            // 4. Save into Mariadb
            await this._weatherRepository.setWeatherInMariadb(weatherData, '37.59.121.52');
            return weatherData;
        } catch (error) {
            throw error;
        }
    }

    public getWeatherScore(weatherData: IWeatherScorePayload): number {
        try {
            // 1. Using Zod to check incoming params
            const validationResult = WeatherScorePayloadSchema.safeParse(weatherData);
            
            if (!validationResult.success) {
                const errorDetails = validationResult.error.issues.map(issue => 
                    `${issue.path.join('.')}: ${issue.message}`
                ).join(', ');
                
                throw new HttpError(`Validation failed: ${errorDetails}`, 500, false); 
            }
            
            // Appending sanitized data to weatherData constant
            const { pressure, humidity } = validationResult.data;
            
            // Checking humidity limits
            if (humidity < 0 || humidity > 100) {
                throw new HttpError('Humidity must be between 0 and 100', 500);
            }

            // Initialising pressure & humidity score params
            let p: number = 0; // Pressure score
            let h: number = 0; // humidity score

            // === 1.Calculating Pressure score (p) ===
            if (pressure >= 1000 && pressure <= 1018) {
                // Mid pressure
                p = 0.5;
            } else if (pressure < 1000) {
                // Low pressure
                p = 1; 
            } else if (pressure > 1018) {
                // High pressure
                p = 0;
            }

            // === 2. Calculating humidity score (h) ===
            // Note : L'humidité est indépendante de la pression pour son calcul de base, 
            // mais le contexte du temps est donné par la pression.

            // Cas 1 : Low humidity (Clear sky)
            if (humidity < 65) {
                h = 0;
            } 
            // Cas 2 :Moderate (cloudy)
            else if (humidity >= 65 && humidity <= 70) {
                h = 1;
                
                // If pressure is very high, even if humidity, the sky will remain clear.
                if (pressure > 1023) {
                    h = 0.5;
                }

            } 
            // Cas 3 : Very high (Rain/Storms)
            else if (humidity > 70) {
                h = 2;
            }

            // === 3. Final Score ===
            const finalScore = p + h;

            // Returns a score between 0 and 4 max.
            return Math.min(finalScore, 4);
        } catch (error) {
            throw error;
        }
        
    }
    
}