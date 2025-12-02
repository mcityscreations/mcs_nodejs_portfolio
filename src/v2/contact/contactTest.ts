// 1. Importer les dépendances
const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;

// Assurez-vous d'exporter votre application Express (app) depuis app.js
// C'est essentiel pour que supertest puisse la cibler
const app = require('../app'); 

// 2. Décrire le module de tests
describe('Routes d\'API pour le module de Contact', function() {
    
    // Un test d'intégration simple pour vérifier que l'API est en ligne
    it('devrait retourner le code de statut 200 et un tableau pour /v2/contact/email', function(done) {
        
        // 3. Simuler la requête HTTP via supertest
        request(app)
            .get('/v2/contact/email') // L'endpoint que l'on veut tester
            .expect(200)            // On vérifie que la réponse a le statut HTTP 200 (OK)
            .end((err: any, res: any) => {
                
                // 4. Effectuer les assertions avec Chai
                
                // Si une erreur Supertest/Mocha se produit, on la renvoie
                if (err) return done(err); 
                
                // On s'attend à ce que le corps de la réponse (res.body) soit un tableau
                expect(res.body).to.be.an('array'); 
                
                // Optionnel : On peut aussi vérifier le contenu du premier élément
                if (res.body.length > 0) {
                    expect(res.body[0]).to.have.property('id_categorie');
                    expect(res.body[0]).to.have.property('nom').that.is.a('string');
                }
                
                // 5. Terminer le test (obligatoire avec les fonctions asynchrones)
                done();
            });
    });

    // Exemple de test pour l'ajout (POST)
    it('devrait retourner le code 400 si le nom de catégorie est manquant à la création', function(done) {
        request(app)
            .post('/v2/contact/email')
            .send({ description: 'Une catégorie sans nom' }) // Données intentionnellement incomplètes
            .expect(400) // On s'attend à une erreur client (Mauvaise requête)
            .end(done); // Le simple fait de recevoir 400 est la validation ici
    });

});