import { createServer } from './server.js';
import { config } from './config.js';

async function start() {
  try {
    const server = await createServer();

    await server.listen({
      port: config.port,
      host: '0.0.0.0',
    });

    console.log(`Server listening on http://localhost:${config.port}`);
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

start();
