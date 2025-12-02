const express = require('express');
import { Router, Request, Response, NextFunction } from "express";
import { injectable } from "tsyringe";
import { HttpError } from "../system/errorHandler/httpError";
import { WeatherService } from "./weatherService";


@injectable()
export class WeatherController {

    public router: Router;

    constructor(
        private readonly _weatherService: WeatherService
    ) {
        // Setting router
        this.router = express.Router();
        // Initializing routes
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get('/last24h',
            this.getLast24h.bind(this)
        );
        this.router.get('/lasthour',
            this.getLastHour.bind(this)
        );
        this.router.get('/fromapi',
            this.getFromAPI.bind(this)
        );
    }

    public async getLast24h(req: Request, res: Response, next: NextFunction){
        try {
            const weatherData = await this._weatherService.getLast24h();
            res.status(200).json(weatherData);
        } catch (error) {
            next(error);
        }
    }

    public async getLastHour(req: Request, res: Response, next: NextFunction){
        try {
            const weatherData = await this._weatherService.getLastHour();
            res.status(200).json(weatherData);
        } catch (error) {
            next(error);
        }
    }

    public async getFromAPI(req: Request, res: Response, next: NextFunction){
        try {
            const weatherData = await this._weatherService.setWeather();
            res.status(200).json(weatherData);
        } catch (error) {
            next(error);
        }
    }
}