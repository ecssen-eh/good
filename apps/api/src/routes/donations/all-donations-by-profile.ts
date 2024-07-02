import type { Handler } from 'express';

import logger from '@good/helpers/logger';

import catchedError from '../../helpers/catchedError';
import prisma from '../../helpers/prisma';
import { noBody } from '../../helpers/responses';

export const get: Handler = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return noBody(res);
  }

  try {
    const donations = await prisma.causeDonation.findMany({
      where: {
        fromProfileId: id.toString()
      }
    });

    logger.info(`Fetched ${donations.length} donations for profile ${id}`);

    return res.status(200).json({ donations, success: true });
  } catch (error) {
    catchedError(res, error);
  }
};
