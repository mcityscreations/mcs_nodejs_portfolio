/** NEWS ROUTE MODULE */

var express = require('express');
var router = express.Router({ mergeParams: true });

// Exhibitions app core module
const news = require('../../src/v2/news');


/*GET latest news*/
router.get('/latest', news.getLatest);

module.exports = router;