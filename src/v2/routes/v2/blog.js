/** BLOG ROUTE MODULE */

var express = require('express');
var blogRouter = express.Router({ mergeParams: true });
const blogModules = require('../../src/v2/blog');
import { container } from "tsyringe";
import { AuthMiddlewares } from "../../src/v2/security/securityMiddlewares";

// Instantiate Auth Middlewares class
const authMiddlewares = container.resolve(AuthMiddlewares);

// Create articles
blogRouter.post('/article', authMiddlewares.getMandatoryAuthMiddleware(), blogModules.createArticle);

// Update articles' translation
blogRouter.put('/article/:id_article/translation', authMiddlewares.getMandatoryAuthMiddleware(), blogModules.updateArticleTranslation);

// Create articles' translation
blogRouter.post('/article/:id_article/translation', authMiddlewares.getMandatoryAuthMiddleware(), blogModules.addArticleTranslation);

// Get new image ID


// Get all article images
blogRouter.get('/articles/:id_article([0-9]{1,6})/images', blogModules.getArticleImages);

// Get article data
blogRouter.get('/articles/:id_article([0-9]{1,6})(-[a-z0-9-]{3,100})?', 
    authMiddlewares.getOptionalAuthMiddleware(), 
    blogModules.getArticleData
);

// Get all articles' list
blogRouter.get('/articles',  
    authMiddlewares.getOptionalAuthMiddleware(), 
    blogModules.getAllArticles
);

blogRouter.get('/categories', blogModules.getArticleCategories);




module.exports = blogRouter;