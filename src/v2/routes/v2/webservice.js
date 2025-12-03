var express = require('express');
var router = express.Router();
const security = require('../../src/v2/security');
const contact = require('../../src/contact');
const artwork = require('../../src/artworks');

/** SEND MAIL */
router.post('/send-email', contact.sendMail);

/*  OAUTH 2.0 AUTHORIZE PAGE / GET method */
router.get('/oauth2/authorize', security.authorize);

/* OAUTH 2.0 TOKEN PAGE / POST method */
router.post('/oauth2/token', security.token);

/* JWT AUTHENTICATION*/
router.post('/jwt/login', security.jwtAuthService);

/** JWT CHECK TOKEN */
router.post('/jwt/check-token', security.checkToken);

/*ADD ARTWORK / POST method */
router.post('/artwork/serie/add', artwork.createSerie);


module.exports = router;