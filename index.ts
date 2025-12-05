// Importing Express app
import app from './src/app';

// Importing http module
import * as http from 'http';

/**
 * Normalizing a port into a number, string or false
 */
function normalizePort(val: string | number): number | string | boolean {
  const port = (typeof val === 'string') ? parseInt(val, 10) : val;
  if (isNaN(port)) { return val; }
  if (port >= 0) { return port; }
  return false;
}

// Retrieving port from .env or default to 4000
const port = normalizePort('4000');
app.set('port', port);

/**
 * Creating the http server.
 */
const server = http.createServer(app);

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening(): void {
  const addr = server.address();
  const bind = (typeof addr === 'string')
    ? 'pipe ' + addr
    : 'port ' + addr?.port;
  console.log('API V2 Listening on ' + bind);
}

/**
 * Event listener for "listening" errors.
 */
function onError(error: NodeJS.ErrnoException): void {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = (typeof port === 'string')
    ? 'Pipe ' + port
    : 'Port ' + port;

  // Handling specific listen errors
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

// Listening on provided port
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

// Exporting server for testing purposes
export default server;