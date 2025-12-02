/**
 * CORE MODULE OF THE V2 API
 */ 

var express = require('express');
var v2 = express.Router({ mergeParams: true });
var artistsRouter = require('./artists');
var artworksRouter = require('./artworks');
var blogRouter = require('./blog');
var categoriesRouter = require('./categories');
var keywordsRouter = require('./keywords');
var newsRouter = require('./news');
var searchRouter = require('./search');
var subjectsRouter = require('./subjects');
var usersRouter = require('./users');


v2.get('',function(req, res, next) {
  const v2HomeData = {
    title: 'Mcitys API',
    version: '2.0',
    description: 'Welcome to Mcitys API v2. This API delivers access to the online catalog of the artist Yves-Léonardo Marchon. All rights reserved.',
    links: [
      {
        rel: 'search',
        content_type: 'application/json',
        hreflang: ['fr', 'en'],
        href: 'https://api.mcitys.com/v2/:id_language(/^[a-zA-Z]{2}$/)/search?query=(/^[a-zA-Z+]{3,25}$/)',
        method: 'GET'
      }
    ]
  }
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(v2HomeData));
});

v2.use('/:id_language([a-z]{2})/search', searchRouter);

v2.use('/:id_language([a-z]{2})/news', newsRouter);

v2.use('/:id_language([a-z]{2})/blog', blogRouter);

v2.use('/:id_language([a-z]{2})/categories', categoriesRouter);

v2.use('/:id_language([a-z]{2})/keywords', keywordsRouter);

v2.use('/:id_language([a-z]{2})/artists', artistsRouter);

v2.use('/:id_language([a-z]{2})/subjects', subjectsRouter);

v2.use('/:id_language([a-z]{2})/users', usersRouter);

v2.use('/:id_language([a-z]{2})/:pseudo_artist([a-z]{3})/artworks', artworksRouter);

module.exports = v2;