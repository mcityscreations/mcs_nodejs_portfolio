/**
 * SUBJECTS ROUTE MODULE
 */
import * as express from "express";
const subjectsRouter = express.Router({ mergeParams: true });
import { SubjectsController } from "../../src/v2/subjects/subjectsController";

// Instantiate Subjects Class
const subjects = new SubjectsController();

/** GET Artist data  */
subjectsRouter.get('/', subjects.getSubjects);


module.exports = subjectsRouter;