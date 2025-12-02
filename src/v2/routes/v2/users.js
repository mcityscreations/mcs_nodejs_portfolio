/**
 * @module usersRouteModule
 */

import * as express from "express";
const usersRouter = express.Router({ mergeParams: true });
import { container } from "tsyringe";
import { UserController } from "../../src/v2/users/usersController";
import { AuthMiddlewares } from "../../src/v2/security/securityMiddlewares";

// Instantiate Artists Class
const users = new UserController();
// Instantiate Auth Middlewares class
const authMiddlewares = container.resolve(AuthMiddlewares);

/** GET Artist data  */
usersRouter.get('/:username/artist', authMiddlewares.getOptionalAuthMiddleware(), users.getArtistIDFromUsername);


module.exports = usersRouter;