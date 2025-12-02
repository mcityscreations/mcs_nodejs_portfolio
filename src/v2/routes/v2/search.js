/** SEARCH ROUTE MODULE */

var express = require('express');
var router = express.Router({ mergeParams: true });

// Exhibitions app core module
const search = require('../../src/v2/search');


/*GET latest news*/
router.get('/', search.execute);

module.exports = router;