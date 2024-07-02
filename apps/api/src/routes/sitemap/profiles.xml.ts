import type { Handler } from 'express';

import { LensHub } from '@good/abis';
import { GOOD_API_URL, IS_MAINNET, LENS_HUB } from '@good/data/constants';
import logger from '@good/helpers/logger';
import catchedError from 'src/helpers/catchedError';
import { SITEMAP_BATCH_SIZE } from 'src/helpers/constants';
import getRpc from 'src/helpers/getRpc';
import { buildSitemapXml } from 'src/helpers/sitemap/buildSitemap';
import { createPublicClient } from 'viem';
import { polygon, polygonAmoy } from 'viem/chains';

export const get: Handler = async (req, res) => {
  const user_agent = req.headers['user-agent'];

  try {
    const viemClient = createPublicClient({
      chain: IS_MAINNET ? polygon : polygonAmoy,
      transport: getRpc({ mainnet: IS_MAINNET })
    });

    // We can't easily retrieve the actual handle count since that
    // would require BigQuery, but we can approximate it using the number of
    // profiles. This does mean that we will miss some profiles since the totalSupply
    // can be smaller than the latest profile ID (due to burning).
    const profileCount = await viemClient.readContract({
      abi: LensHub,
      address: LENS_HUB,
      args: [],
      functionName: 'totalSupply'
    });

    logger.info(`Profile count retrieved: ${profileCount}`);

    const totalHandles = Number(profileCount) || 0;
    const totalBatches = Math.ceil(totalHandles / SITEMAP_BATCH_SIZE);

    const entries = Array.from({ length: totalBatches }, (_, index) => ({
      loc: `${GOOD_API_URL}/sitemap/profiles/${index + 1}.xml`
    }));

    const xml = buildSitemapXml(entries);

    logger.info(
      `Lens: Fetched all profiles sitemap index having ${totalBatches} batches from user-agent: ${user_agent}`
    );

    return res.status(200).setHeader('Content-Type', 'text/xml').send(xml);
  } catch (error) {
    return catchedError(res, error);
  }
};
