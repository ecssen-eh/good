import type { ListenerClient } from 'src/server';

import { GoodDonation } from '@good/abis';
import { GOOD_DONATION } from '@good/data/constants';
import logger from '@good/helpers/logger';
import { z } from 'zod';

import prisma from '../helpers/prisma';

const donationEventValidator = z.object({
  amount: z.bigint(),
  from: z.string(),
  fromProfileId: z.bigint().transform((id) => id.toString(16)),
  publicationId: z.bigint().transform((id) => id.toString(16)),
  to: z.string(),
  token: z.string(),
  toProfileId: z.bigint().transform((id) => id.toString(16))
});

interface MakeDonationInput extends z.infer<typeof donationEventValidator> {
  txHash: string;
}

async function makeDonation(input: MakeDonationInput) {
  const cause = await prisma.cause.findFirstOrThrow({
    where: {
      profileId: input.fromProfileId,
      publicationId: input.publicationId
    }
  });

  const data = await prisma.causeDonation.create({
    data: {
      amount: input.amount,
      causeId: cause.id,
      fromAddress: input.from,
      fromProfileId: input.fromProfileId,
      tokenAddress: input.token,
      txHash: input.txHash
    }
  });

  logger.info(`Created a donation ${data.id}`);
}

export default function listenDonations(client: ListenerClient) {
  client.watchContractEvent({
    abi: GoodDonation,
    address: GOOD_DONATION,
    eventName: 'DonationSent',
    onError(error) {
      logger.error('Failed to watch donation contract event', error);
    },
    onLogs: (logs) => {
      for (const event of logs) {
        const { args } = event;
        const input = donationEventValidator.safeParse(args);

        if (!input.success) {
          logger.error(`Failed to parse event: ${input.error}`);
          continue;
        }

        try {
          makeDonation({ ...input.data, txHash: event.transactionHash });
        } catch (error) {
          logger.error(`Failed to make donation: ${error}`);
        }
      }
    }
  });
}
