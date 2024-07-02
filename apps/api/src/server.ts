// Load environment variables
import dotenv from 'dotenv';

dotenv.config({ override: true });

import { IS_MAINNET } from '@good/data/constants';
import logger from '@good/helpers/logger';
import cors from 'cors';
import express from 'express';
import { router } from 'express-file-routing';
import { createPublicClient, webSocket } from 'viem';
import { polygon, polygonAmoy } from 'viem/chains';
import ViteExpress from 'vite-express';

import listenCauses from './listeners/cause-listener';
import listenDonations from './listeners/donation-listener';

const app = express();

// Middleware configuration
app.use(cors());
app.disable('x-powered-by');

const setupRoutes = async () => {
  // Route configuration
  app.use('/', express.json({ limit: '1mb' }), await router());

  // Start the server
  ViteExpress.listen(app, 4784, () => {
    logger.info('Server is listening on port 4784...');
  });
};

const createClient = () =>
  createPublicClient({
    chain: IS_MAINNET ? polygon : polygonAmoy,
    transport: webSocket('wss://polygon-amoy-bor-rpc.publicnode.com')
  });

export type ListenerClient = ReturnType<typeof createClient>;

const setupListeners = () => {
  const publicClient = createClient();
  listenDonations(publicClient);
  listenCauses(publicClient);
};

try {
  setupListeners();
} catch (error) {
  logger.error(`Error setting up listeners: ${error}`);
}

// Initialize routes
setupRoutes().catch((error) => {
  logger.error('Error setting up routes', error);
});
