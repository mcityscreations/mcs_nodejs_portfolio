// routes/v2/keywords.js

import * as express from "express";
const keywordsRouter = express.Router({ mergeParams: true });
import { KeywordsController } from "../../src/v2/keywords/keywordsController";

// Keywords controller
const keywordsController = new KeywordsController(); 

/*GET keywords' list*/
keywordsRouter.get('/', keywordsController.getKeywordsList);

/**POST keyword */
keywordsRouter.post('/', keywordsController.addKeyword);

module.exports = keywordsRouter;