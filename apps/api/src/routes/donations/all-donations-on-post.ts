import type { Handler } from 'express';

import logger from '@good/helpers/logger';

import catchedError from '../../helpers/catchedError';
import prisma from '../../helpers/prisma';
import { noBody } from '../../helpers/responses';

export const get: Handler = async (req, res) => {
  const { profileId, publicationId } = req.query;

  if (!publicationId || !profileId) {
    return noBody(res);
  }

  try {
    const data = await prisma.causeDonation.findMany({
      where: {
        cause: {
          profileId: profileId?.toString(),
          publicationId: publicationId.toString()
        }
      }
    });

    logger.info(
      `Lens: Fetched all donations on post for score for ${profileId}-${publicationId}`
    );

    return res.status(200).json({ donations: data, success: true });
  } catch (error) {
    catchedError(res, error);
  }
};
