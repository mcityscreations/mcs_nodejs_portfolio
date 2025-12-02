/**
 * @module getLinkFromItemID
 * 
 * @description This module generates dynamic links for the sites' content 
 * from data stored into the database
 * 
 * @param {string} idLanguage
 * @param {string} idItem
 * @returns {Promise<Link>}
 */

class Link {
    constructor(absolute, relative){
        this.absolute = absolute;
        this.relative = relative;
    }
}

const sqlEngine = require('../../../database/sqlEngine');
const serverAddresses = require('../../serverAddress');
const uriFormat = require('../../uriFormat/encodeStringsToURIStandard');

module.exports = (idLanguage, idItem) => {
    return new Promise(async (resolve, reject)=>{
        try {

            if (!idLanguage.match(/^[a-zA-Z]{2}/)) {
                throw {message: 'Wrong value for param language ID', code : 400}
            }

            const artworkRegex = /^A[0-9]{4}$/;
            const articleRegex = /^\d{1,4}$/;
            if (artworkRegex.test(idItem)) {
                const sqlRequest = `SELECT
                mcs_artwork_index.id_category AS id_category,
                mcs_artwork_index.id_technique AS id_technique,
                mcs_category_index.title AS category_title,
                mcs_technique_index.title AS technique_title,
                mcs_artwork_title.title AS artwork_title
    
                FROM mcs_artwork_index
                
                INNER JOIN mcs_category_index ON mcs_artwork_index.id_category = mcs_category_index.id_category
                INNER JOIN mcs_technique_index ON mcs_artwork_index.id_technique = mcs_technique_index.id_technique
                INNER JOIN mcs_artwork_title ON mcs_artwork_index.id_artwork = mcs_artwork_title.id_artwork
                
                WHERE mcs_artwork_index.id_artwork = ?
                AND mcs_artwork_title.id_language = ?
                `;
                const sqlParams = [idItem, idLanguage];
                const artworkResult = await sqlEngine.execute(sqlRequest, sqlParams, 'standard');
                const newLink = new Link(
                    serverAddresses.defineHostname().centralServer()+'/'+idLanguage+'/ylm/artworks/'+artworkResult[0]['category_title'].toLowerCase()+'/'+artworkResult[0]['technique_title'].toLowerCase()+'/'+idItem+'-'+uriFormat.convert(artworkResult[0]['artwork_title']),
                    '/ylm/artworks/'+artworkResult[0]['category_title'].toLowerCase()+'/'+artworkResult[0]['technique_title'].toLowerCase()+'/'+idItem+'-'+uriFormat.convert(artworkResult[0]['artwork_title'])
                )
                resolve(newLink);
                
            } else if (articleRegex.test(idItem)) {
                const sqlRequest = `SELECT title FROM mcs_blog_article_title WHERE id_language = ? and id_article = ?`;
                const sqlParams = [idLanguage, idItem];
                const articleResult = await sqlEngine.execute(sqlRequest, sqlParams, 'standard');
                const newLink = new Link(
                    serverAddresses.defineHostname().centralServer()+'/'+idLanguage+'/blog/articles/'+idItem+'-'+uriFormat.convert(articleResult[0]['title']),
                    '/blog/articles/'+idItem+'-'+uriFormat.convert(articleResult[0]['title'])
                )
                resolve(newLink);
            } else {
                reject({message: 'Unable to parse item ID', code: 400});
            }
        } catch (error) {
            reject(error);
        }
        
    })
}