// Importation de l'application Express configurée
import app from './src/app';

// Importation des utilitaires nécessaires
import * as http from 'http';

/**
 * Normalise un port en nombre, chaîne, ou false.
 */
function normalizePort(val: string | number): number | string | boolean {
  const port = (typeof val === 'string') ? parseInt(val, 10) : val;
  if (isNaN(port)) { return val; }
  if (port >= 0) { return port; }
  return false;
}

// Récupération du port (du .env, ou par défaut)
const port = normalizePort('4000');
app.set('port', port);

/**
 * Crée le serveur HTTP.
 */
const server = http.createServer(app);

/**
 * Gestionnaire d'événements pour l'écoute du port HTTP du serveur.
 */
function onListening(): void {
  const addr = server.address();
  const bind = (typeof addr === 'string')
    ? 'pipe ' + addr
    : 'port ' + addr?.port;
  console.log('API V2 Listening on ' + bind);
}

/**
 * Gestionnaire d'événements pour l'erreur "listening".
 */
function onError(error: NodeJS.ErrnoException): void {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = (typeof port === 'string')
    ? 'Pipe ' + port
    : 'Port ' + port;

  // Gérer les erreurs d'écoute spécifiques avec des messages amicaux
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

// Écoute sur le port fourni, sur toutes les interfaces réseau.
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

// Exportation du serveur pour les tests
export default server;