// cronService.ts

import * as cron from 'node-cron';
import { WeatherService } from '../../weather/weatherService';

/**
 * Configure et démarre les tâches Cron.
 * @param weatherService - L'instance de WeatherService pour l'exécution de la tâche.
 */
export function startWeatherCronJob(weatherService: WeatherService): void {
    
    // Expression pour s'exécuter toutes les heures, à la minute 0.
    // L'expression est : [minute] [heure] [jour du mois] [mois] [jour de la semaine]
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
        timezone: "Europe/Paris" // Garder l'option supportée
    });

    task.start();
}