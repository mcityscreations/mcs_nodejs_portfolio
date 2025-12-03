import { z } from 'zod';

// 1. Defining the scheme of a 'weather' item
const WeatherItemSchema = z.object({
    id: z.number(),
    main: z.string(),
    description: z.string(),
    icon: z.string(),
});

// 2. Defining the scheme of the 'current' block
const CurrentWeatherSchema = z.object({
    dt: z.number(), // timestamp
    temp: z.number(),
    pressure: z.number(),
    humidity: z.number(),
    weather: z.array(WeatherItemSchema).min(1, "Le tableau 'weather' ne doit pas être vide"),
    // Note: z.object().partial() makes properties optional
});

// 3. Scheme of the complete OpenWeattherMap response
export const OpenWeatherMapRawResponseSchema = z.object({
    lat: z.number(),
    lon: z.number(),
    timezone: z.string(),
    current: CurrentWeatherSchema,
});


/** OpenWeather Options */

// Exclude options
const OpenWeatherExcludeBlockSchema = z.enum(['current', 'minutely', 'hourly', 'daily', 'alerts']);
export const OpenWeatherExcludeArraySchema = z.array(OpenWeatherExcludeBlockSchema)
                                              // Permet au champ d'être undefined ou null
                                             .nullable()
                                             .optional();

// All options
const OpenWeatherUnitSchema = z.enum(['standard', 'metric', 'imperial']);
export const OpenWeatherOptionsSchema = z.object({
    exclude: OpenWeatherExcludeArraySchema,
    units: OpenWeatherUnitSchema,
    lang: z.string()
})
.nullable()
.optional();
// OpenWeather Options inference type
export type OpenWeatherExcludeBlock = z.infer<typeof OpenWeatherExcludeBlockSchema>;
export type OpenWeatherUnit = z.infer<typeof OpenWeatherUnitSchema>;

// WeatherScorePayload Schema
export const WeatherScorePayloadSchema = z.object({
    
    // Converting strings to numbers
    pressure: z.coerce.number()
               .positive("La pression doit être une valeur positive."),
               
    humidity: z.coerce.number()
                .min(0, "L'humidité doit être au minimum 0.")
                .max(100, "L'humidité doit être au maximum 100."),
});
// Exporting interface
export type IWeatherScorePayload = z.infer<typeof WeatherScorePayloadSchema>;