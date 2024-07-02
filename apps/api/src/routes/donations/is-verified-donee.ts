import type { Handler } from 'express';

import { GoodDonation } from '@good/abis';
import { GOOD_DONATION, IS_MAINNET } from '@good/data/constants';
import logger from '@good/helpers/logger';
import catchedError from 'src/helpers/catchedError';
import { noBody } from 'src/helpers/responses';
import { createPublicClient, http } from 'viem';
import { polygon, polygonAmoy } from 'viem/chains';

const publicClient = createPublicClient({
  chain: IS_MAINNET ? polygon : polygonAmoy,
  transport: http('https://polygon-amoy-bor-rpc.publicnode.com')
});

async function verifyDoneeId(doneeId: `0x${string}`) {
  const verified = await publicClient.readContract({
    abi: GoodDonation,
    address: GOOD_DONATION,
    args: [doneeId],
    functionName: 'isVerifiedDonee'
  });

  return verified;
}

export const get: Handler = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return noBody(res);
  }
  logger.info(`checked verification status of id ${id}`);

  try {
    let idString = id.toString();
    if (idString.indexOf('0x') !== 0) {
      throw 'Invalid id. Expected a string of the form `0x${string}`';
    }

    const verified = await verifyDoneeId(idString as any);
    return res.status(200).json({ success: true, verified });
  } catch (error) {
    catchedError(res, error);
  }
};
