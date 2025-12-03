// cronService.ts

import * as cron from 'node-cron';
import { WeatherService } from '../../weather/weatherService';

/**
 * Sets up and starts Cron jobs.
 * @param weatherService - The instance of WeatherService to execute the job.
 */
export function startWeatherCronJob(weatherService: WeatherService): void {
    
    // Cron expression to run every hour at minute 0
    const cronExpression = '0 * * * *'; 

    console.log(`Démarrage de la tâche Cron de pré-récupération météo avec l'expression : ${cronExpression}`);

    const task = cron.schedule(cronExpression, async () => {
        
        console.log(`--- Exécution du Cron (Heure: ${new Date().toTimeString()}) ---`);
        
        try {
            await weatherService.setWeather(); 
            console.log('Météo mise à jour avec succès.');
            
        } catch (error) {
            console.error('Erreur critique lors de l\'exécution du Cron de météo :', error);
        }
        
    }, {
        timezone: "Europe/Paris"
    });

    task.start();
}