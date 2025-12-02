/**
 * CONTACT ROUTE MODULE
 */
import * as express from "express";
const contactRouter = express.Router({ mergeParams: true });
import { ContactController } from "../../src/v2/contact/contactController";
import { emailDTO } from "../../src/v2/contact/contactValidator";
import { container } from "tsyringe";
import { AuthMiddlewares } from "../../src/v2/security/securityMiddlewares";

// Instantiate Categories Class
const _contactController = new ContactController();
const _securityGateService = container.resolve(AuthMiddlewares);

/** POST send emails */
contactRouter.post('/email',
    // Checking input data
    emailDTO,
    // Checking if user is authenticated
    _securityGateService.getMandatoryAuthMiddleware(),
    // Handling JWT errors
    _securityGateService.jwtErrorHandler.bind(_securityGateService),
    // Checking if user has the right permissions
    _securityGateService.permissionGuard(['ADMIN','ARTIST']),
    // Sending email
    _contactController.sendEmail);

module.exports = contactRouter;