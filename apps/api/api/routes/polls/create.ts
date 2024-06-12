import type { Handler } from 'express';

import logger from '@good/helpers/logger';
import catchedError from 'api/helpers/catchedError';
import validateLensAccount from 'api/helpers/middlewares/validateLensAccount';
import prisma from 'api/helpers/prisma';
import { invalidBody, noBody, notAllowed } from 'api/helpers/responses';
import { array, number, object, string } from 'zod';

type ExtensionRequest = {
  length: number;
  options: string[];
};

const validationSchema = object({
  length: number(),
  options: array(string())
});

export const post: Handler = async (req, res) => {
  const { body } = req;

  if (!body) {
    return noBody(res);
  }

  const validation = validationSchema.safeParse(body);

  if (!validation.success) {
    return invalidBody(res);
  }

  const validateLensAccountStatus = await validateLensAccount(req);
  if (validateLensAccountStatus !== 200) {
    return notAllowed(res, validateLensAccountStatus);
  }

  const { length, options } = body as ExtensionRequest;

  if (length < 1 || length > 30) {
    return res.status(400).json({
      error: 'Poll length should be between 1 and 30 days.',
      success: false
    });
  }

  try {
    const data = await prisma.poll.create({
      data: {
        endsAt: new Date(Date.now() + length * 24 * 60 * 60 * 1000),
        options: {
          createMany: {
            data: options.map((option, index) => ({ index, option })),
            skipDuplicates: true
          }
        }
      },
      select: { createdAt: true, endsAt: true, id: true, options: true }
    });

    logger.info(`Created a poll ${data.id}`);

    return res.status(200).json({ poll: data, success: true });
  } catch (error) {
    return catchedError(res, error);
  }
};