/**
 * ARTISTS ROUTE MODULE
 */
import * as express from "express";
const artistsRouter = express.Router({ mergeParams: true });
import { ArtistsController } from "../../src/v2/artists/artistsController";
import { AuthMiddlewares } from "../../src/v2/security/securityMiddlewares";
import { container } from 'tsyringe';

// Instantiate Artists Class
const artists = new ArtistsController();
// Instantiate Auth Middlewares class
const authMiddlewares = container.resolve(AuthMiddlewares);

/** GET Artist data  */
artistsRouter.get('/:id_artist(ART[0-9]{4})', authMiddlewares.getOptionalAuthMiddleware(), artists.getArtist);


module.exports = artistsRouter;