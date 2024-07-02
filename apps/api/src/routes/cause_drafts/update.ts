import type { Handler } from 'express';

import logger from '@good/helpers/logger';
import parseJwt from '@good/helpers/parseJwt';
import goodPg from 'src/db/goodPg';
import catchedError from 'src/helpers/catchedError';
import validateLensAccount from 'src/helpers/middlewares/validateLensAccount';
import { invalidBody, noBody, notAllowed } from 'src/helpers/responses';
import { object, string } from 'zod';

type ExtensionRequest = {
  content: string;
  id: null | string;
};

const validationSchema = object({
  content: string().min(1).max(100000),
  id: string().nullable()
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

  const { content, id } = body as ExtensionRequest;

  try {
    const identityToken = req.headers['x-identity-token'] as string;
    const payload = parseJwt(identityToken);

    if (id) {
      const result = await goodPg.query(
        `
          UPDATE "CauseDraftPublication"
          SET "content" = $1
          WHERE "id" = $2
          RETURNING *;
        `,
        [content, id]
      );

      logger.info(`Draft updated for ${payload.id} - ${result[0]?.id}`);

      return res.status(200).json({ result: result[0], success: true });
    } else {
      const result = await goodPg.query(
        `
          INSERT INTO "CauseDraftPublication" ("profileId", "content", "updatedAt")
          VALUES ($1, $2, now())
          RETURNING *;
        `,
        [payload.id, content]
      );

      logger.info(`Draft created for ${payload.id} - ${result[0]?.id}`);

      return res.status(200).json({ result: result[0], success: true });
    }
  } catch (error) {
    return catchedError(res, error);
  }
};
