import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { config } from './config/env.js';

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    const server = app.listen(config.port, () => {
      console.log(`[Auth Server] Running in ${config.nodeEnv} mode on port ${config.port}`);
      console.log(`[Auth Server] CORS allowed origin: ${config.clientUrl}`);
    });

    // Graceful shutdown handling
    const shutdown = async (signal) => {
      console.log(`\n[Auth Server] Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDB();
        console.log('[Auth Server] Process terminated cleanly.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error(`[Auth Server Initialization Error]:`, error);
    process.exit(1);
  }
};

startServer();
