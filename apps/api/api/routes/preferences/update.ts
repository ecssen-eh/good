import type { Handler } from 'express';

import logger from '@good/helpers/logger';
import parseJwt from '@good/helpers/parseJwt';
import catchedError from 'api/helpers/catchedError';
import validateLensAccount from 'api/helpers/middlewares/validateLensAccount';
import prisma from 'api/helpers/prisma';
import { invalidBody, noBody, notAllowed } from 'api/helpers/responses';
import { boolean, number, object, string } from 'zod';

type ExtensionRequest = {
  appIcon?: number;
  highSignalNotificationFilter?: boolean;
  id?: string;
};

const validationSchema = object({
  appIcon: number().optional(),
  highSignalNotificationFilter: boolean().optional(),
  id: string().optional()
});

export const post: Handler = async (req, res) => {
  const { body } = req;

  if (!body) {
    return noBody(res);
  }

  const accessToken = req.headers['x-access-token'] as string;
  const validation = validationSchema.safeParse(body);

  if (!validation.success) {
    return invalidBody(res);
  }

  const validateLensAccountStatus = await validateLensAccount(req);
  if (validateLensAccountStatus !== 200) {
    return notAllowed(res, validateLensAccountStatus);
  }

  const { appIcon, highSignalNotificationFilter } = body as ExtensionRequest;

  try {
    const payload = parseJwt(accessToken);

    const data = await prisma.preference.upsert({
      create: { appIcon, highSignalNotificationFilter, id: payload.id },
      update: { appIcon, highSignalNotificationFilter },
      where: { id: payload.id }
    });

    logger.info(`Updated preferences for ${payload.id}`);

    return res.status(200).json({ result: data, success: true });
  } catch (error) {
    return catchedError(res, error);
  }
};