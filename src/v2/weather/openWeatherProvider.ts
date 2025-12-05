import axios from "axios";
import { injectable } from "tsyringe";
import { WeatherProvider, IOpenWeatherOptions, IWeatherData, IOpenAPIResponse } from "./weatherInterfaces";
import { OpenWeatherMapRawResponseSchema, OpenWeatherExcludeArraySchema } from './weatherValidators';
import { HttpError } from "../system/errorHandler/httpError";
import e from "express";

@injectable()
export class OpenWeatherProvider extends WeatherProvider {
    private apiKey: string;
    private baseUrl: string = 'https://api.openweathermap.org/data/3.0/onecall';

    constructor(apiKey: string){
        super();
        this.apiKey = apiKey;
    }
  
    public async getCurrentWeather(lat: number, lon: number, options: IOpenWeatherOptions): Promise<IWeatherData>{
        try {
            // Handling options
            const optionsValidationResult = OpenWeatherExcludeArraySchema.safeParse(options.exclude);

            if (!optionsValidationResult.success) {
                console.error("Erreur de validation de l'API OpenWeatherMap:", optionsValidationResult.error);
                throw new HttpError('Invalid options parameters for OpenWeatherMAp.', 500, false);
            }

            // 1. Defining a variable to store the 'exclude' string
            let excludeParam: string | undefined = undefined;

            // 2. Checking if options.exclude exists and is an array (which Zod validated)
            if (Array.isArray(options.exclude)) {
                excludeParam = options.exclude.join(',');
            }
            const response = await axios.get<IOpenAPIResponse>(this.baseUrl, {
                params: {
                    lat: lat,
                    lon: lon,
                    appid: this.apiKey,
                    units: 'metric',
                    lang: 'fr',
                    exclude: excludeParam,
                }
            });

            const rawData = response.data;

           // Validating the raw data structure
            const validationResult = OpenWeatherMapRawResponseSchema.safeParse(rawData);

            if (!validationResult.success) {
                console.error("Erreur de validation de l'API OpenWeatherMap:", validationResult.error);
                throw new HttpError('Structure de données API invalide. Impossible de transformer en IWeatherData.', 500, false);
            }

            const validRawData = validationResult.data;

            // Get current date
            const date = new Date(validRawData.current.dt * 1000);

            const unifiedData: IWeatherData = {
                date: date,
                temperature: validRawData.current.temp,
                pressure: validRawData.current.pressure,
                humidity: validRawData.current.humidity,
            };

            return unifiedData;

        } catch (error) {
            console.error("Erreur lors de la récupération des données OpenWeatherMap:", error);
            throw new HttpError(`Impossible de récupérer la météo pour Marseille via OpenWeatherMap.`, 500, true);
        }
    }
}