/**
 * CATEGORY ROUTE MODULE
 */
import * as express from "express";
const categoryRouter = express.Router({ mergeParams: true });
import { Categories } from '../../src/v2/categories';


// Instantiate Categories Class
const categories = new Categories();

/** GET Techniques associated to a given category */
categoryRouter.get('/:id_category(C[0-9]{4})/techniques', categories.getAllTechniques);

/** GET Techniques associated to a given category */
categoryRouter.get('/', categories.getAllCategories);

module.exports = categoryRouter;