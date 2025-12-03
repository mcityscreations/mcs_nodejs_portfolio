import 'reflect-metadata'; // DOIT RESTER LE PREMIER
require('dotenv').config();

// Node.js dependencies
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var helmet = require('helmet');
import { handle as errorHandler } from './v2/system/errorHandler/errorHandler';

// DI modules
import { container } from 'tsyringe';
import { registerDependencies } from './v2/system/diManagement/dependenciesConfig'; 
import { SecurityController } from './v2/security/securityController';
import { WeatherController } from './v2/weather/weatherController';
import { WeatherService } from './v2/weather/weatherService';
import { startWeatherCronJob } from './v2/system/cron/cronService';
import { NextFunction, Request, Response } from 'express';

// --- APP SETUP ---

// 1. Initializing the DI container
registerDependencies(); 

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// --- MIDDLEWARES ---

app.use(helmet());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// CORS configuration
var corsOptions = {
  origin: ['http://localhost:4200', 'https://185.221.182.193'],
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions));

// --- SETTING CONTROLLERS THROUGH DI MECHANISM ---

// 2. Resolving SecurityController
const securityControllerInstance = container.resolve(SecurityController);
const weatherControllerInstance = container.resolve(WeatherController);

// Starting Cron jobs
const weatherServiceInstance = container.resolve(WeatherService);
startWeatherCronJob(weatherServiceInstance);

// 3. New routing mechanism : Attaching the controllers to the app
app.use('/v2/security', securityControllerInstance.router);
app.use('/v2/weather', weatherControllerInstance.router);

// --- ERROR HANDLING ---

// catch 404 and forward to error handler
app.use(function(req: Request, res: Response, next: NextFunction) {
  next(createError(404));
});

// error handler
app.use(function(err: any, req: Request, res: Response, next: NextFunction) {

    // 2. Utilisation de votre fonction 'handle' pour formater le message
    // Votre fonction handle doit être capable de gérer 'err' qui est ici un HttpError.
    const formattedError = errorHandler(err);
    
    // 3. Assurer que le code est cohérent pour l'envoi
    const finalStatusCode = err.status || formattedError.statusCode || 500;
    
    // Envoi de la réponse formatée
    res.status(finalStatusCode).json({
        message: formattedError.message,
        statusCode: formattedError.statusCode
    });
});

export default app;