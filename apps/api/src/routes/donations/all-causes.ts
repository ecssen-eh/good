import type { Handler } from 'express';

import logger from '@good/helpers/logger';

import catchedError from '../../helpers/catchedError';
import prisma from '../../helpers/prisma';

export const get: Handler = async (req, res) => {
  try {
    const data = await prisma.cause.findMany();

    logger.info(`Lens: Fetched all causes`);

    return res.status(200).json({ causes: data, success: true });
  } catch (error) {
    catchedError(res, error);
  }
};
