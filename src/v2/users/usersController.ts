/**
 * @class UserController
 * @description This module handles http requests associated to Users
 */

import { Response, Request } from "express";
import { handle } from "../system/errorHandler";
import { ArtistsService } from "../artists/artistsService";
const artistsService = new ArtistsService();

export class UserController {

    /**
     * @method getArtistIDFromUsername
     * @description Retrieves the artist ID associated with a given username (authData from request parameters).
     * @param req 
     * @param res
     * @returns {Promise<{idArtist: string}>}
     */
    public async getArtistIDFromUsername (req: any, res: Response) {

        try {
            if (!req.authData || !req.authData === undefined || req.authData === '') {
                throw handle('Access denied. Unknown user name.', 403, true);
            }
            const artistID = await artistsService.getArtist(req.authData.user);
            res.status(200).json(artistID);
        } catch (error: any) {
            const statusCode = error.code || 500;
            res.status(statusCode).json(error);
        }
        
    }
}