import { HttpError } from "../system/errorHandler/httpError";
import { ProviderType, IWeatherProviderConfig, WeatherProvider } from "./weatherInterfaces";
import { OpenWeatherProvider } from "./openWeatherProvider";

/**
 * Function that transforms env. variables (strings by default) to boolean values
 */
const toBoolean = (envVar: string | undefined): boolean => {
    // If variable is undefined, return False by default
    if (!envVar) return false; 
    
    // Converting to lowercase for verification
    const value = envVar.toLowerCase();
    
    // Returns true if the value is 'true', '1', 'yes', 'on', etc.
    return value === 'true' || value === '1' || value === 'yes' || value === 'on';
};

const weatherConfig: IWeatherProviderConfig = {
    openWeatherMap: {
        apiKey: process.env.OPEN_WEATHER_MAP_API_KEY || '',
        enabled: toBoolean(process.env.OPEN_WEATHER_MAP_ENABLED),
    },
    accuWeather: {
        apiKey: process.env.ACCU_WEATHER_API_KEY || '',
        enabled: toBoolean(process.env.ACCU_WEATHER_ENABLED), // Disabled by default
    },
    meteoFrance: {
        apiKey: process.env.METEO_FRANCE_API_KEY || '',
        enabled: toBoolean(process.env.METEO_FRANCE_ENABLED), // Disabled by default
    },
    defaultProvider: (process.env.DEFAULT_WEATHER_PROVIDER as ProviderType) || 'OPEN_WEATHER_MAP',
};

/**
 * Factory that returns an instance of WeatherProvider
 *
 * @param providerType - The provider to instantiate.
 * @returns The requested provider as an instance of the WeatherProvider class.
 * @throws An error if the provider is not configured or unkown
 */
export function createWeatherProvider(providerType: ProviderType): WeatherProvider {
    switch (providerType) {
        case 'OPEN_WEATHER_MAP':
            if (!weatherConfig.openWeatherMap.enabled || !weatherConfig.openWeatherMap.apiKey) {
               throw new HttpError('OpenWeatherMap Provider is disabled in config or missing API key.', 500, false);
            }
            return new OpenWeatherProvider(weatherConfig.openWeatherMap.apiKey);

        case 'ACCU_WEATHER':
            if (!weatherConfig.accuWeather.enabled || !weatherConfig.accuWeather.apiKey) {
                throw new HttpError('AccuWeather Provider is disabled or missing API key.', 500, false);
            }
            throw new HttpError('AccuWeather not yet implemented.', 500, false);

        case 'METEO_FRANCE':
            if (!weatherConfig.accuWeather.enabled || !weatherConfig.accuWeather.apiKey) {
                throw new HttpError('MeteoFrance Provider is disabled or missing API key.', 500, false);
            }
            throw new HttpError('MeteoFrance not yet implemented.', 500, false);


        default:
            throw new HttpError(`Unknown weather provider type: ${providerType}`, 500, false);
    }
}