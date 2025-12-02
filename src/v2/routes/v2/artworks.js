/**
 * ARTWORKS ROUTE MODULE
 */

var express = require('express');
var artworkRouter = express.Router({ mergeParams: true });
const artworkModules = require('../../src/v2/artworks');
import { container } from 'tsyringe';
import { AuthMiddlewares } from "../../src/v2/security/securityMiddlewares";

// Instantiate Auth Middlewares class
const authMiddlewares = container.resolve(AuthMiddlewares);

/** POST Create artwork */
artworkRouter.post('/', authMiddlewares.getMandatoryAuthMiddleware(), artworkModules.createArtwork)


artworkRouter.get('/:id_artwork(A[0-9]{4})/category', artworkModules.getArtworkCategory);


artworkRouter.get('/:id_artwork(A[0-9]{4})',authMiddlewares.getOptionalAuthMiddleware(), artworkModules.getArtworkData);


artworkRouter.get('/:id_artwork(A[0-9]{4})/images', artworkModules.getArtworkImages);


artworkRouter.get('/:category',authMiddlewares.getOptionalAuthMiddleware(), artworkModules.getArtworksPerCategory)

/* GET artist's artwork techniques*/
artworkRouter.get('/:category/:technique', authMiddlewares.getOptionalAuthMiddleware(), artworkModules.getArtworksPerTechnique);

/* GET artist's artwork data*/
artworkRouter.get('/:category_title/:technique_title/:id_artwork(A[0-9]{4})-([a-z0-9-]{3,100})', authMiddlewares.getOptionalAuthMiddleware(), artworkModules.getArtworkData);

module.exports = artworkRouter;