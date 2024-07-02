import type { Handler } from 'express';

import { IS_MAINNET } from '@good/data/constants';
import LensEndpoint from '@good/data/lens-endpoints';
import logger from '@good/helpers/logger';
import axios from 'axios';
import catchedError from 'src/helpers/catchedError';
import { GOOD_USER_AGENT, SITEMAP_BATCH_SIZE } from 'src/helpers/constants';
import { invalidBody, noBody } from 'src/helpers/responses';
import { buildUrlsetXml } from 'src/helpers/sitemap/buildSitemap';

function getProfileIdsForBatch(batch: number): string[] {
  const result: string[] = [];

  const startId = (batch - 1) * SITEMAP_BATCH_SIZE + 1;
  const endId = batch * SITEMAP_BATCH_SIZE;

  for (let id = startId; id <= endId; id++) {
    let hexId = id.toString(16);

    // Lens API requires all hex strings to have even length
    if (hexId.length % 2 !== 0) {
      hexId = `0${hexId}`;
    }

    result.push(`0x${hexId}`);
  }

  return result;
}

interface ProfileLocalNameResponse {
  handle: { localName: string } | null;
}

async function fetchProfileLocalNames(profileIds: string[]): Promise<string[]> {
  const profilesQuery = {
    query: `
      query ProfileHandleLocalNames($request: ProfilesRequest!) {
        profiles(request: $request) {
          items {
            handle {
              localName
            }
          }
        }
      }
    `,
    variables: {
      request: {
        where: {
          profileIds: profileIds
        }
      }
    }
  };

  const { data } = await axios.post(
    IS_MAINNET ? LensEndpoint.Mainnet : LensEndpoint.Testnet,
    profilesQuery,
    {
      headers: {
        'Content-Type': 'application/json',
        'User-agent': GOOD_USER_AGENT
      }
    }
  );

  const localNamesResponse: ProfileLocalNameResponse[] =
    data.data.profiles.items;

  const localNames = localNamesResponse
    .filter((value) => value.handle !== null)
    .map((value) => value.handle!.localName);

  return localNames;
}

export const config = {
  api: { responseLimit: '8mb' }
};

export const get: Handler = async (req, res) => {
  const batch = req.params.id;

  if (!batch) {
    return noBody(res);
  }

  const batchNumber = Number(batch);

  if (isNaN(batchNumber) || batchNumber <= 0) {
    return invalidBody(res);
  }

  const user_agent = req.headers['user-agent'];

  try {
    const profileIds = getProfileIdsForBatch(batchNumber);
    const localNames = await fetchProfileLocalNames(profileIds);

    const entries = localNames.map((localName) => ({
      loc: `https://bcharity.net/u/${localName}`
    }));

    const xml = buildUrlsetXml(entries);

    logger.info(
      `Lens: Fetched profiles sitemap for batch ${batch} having ${localNames.length} entries from user-agent: ${user_agent}`
    );

    return res.status(200).setHeader('Content-Type', 'text/xml').send(xml);
  } catch (error) {
    return catchedError(res, error);
  }
};
