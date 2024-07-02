import { GOOD_DONATION } from '@good/data/constants';
import { encodeAbiParameters } from 'viem';

import type { CreatePublicationProps } from './useActOnUnknownOpenAction';

import useActOnUnknownOpenAction from './useActOnUnknownOpenAction';

export interface DonationData {
  amount: bigint; // uint256
  tokenAddress: `0x${string}`; // address
}

const useActOnDonationOpenAction = (
  params: CreatePublicationProps & { publicationId: string }
) => {
  const { actOnUnknownOpenAction, isLoading, txHash, txId } =
    useActOnUnknownOpenAction(params);

  const makeDonation = (data: DonationData) => {
    const d = encodeAbiParameters(
      [
        { name: 'tokenAddress', type: 'address' },
        { name: 'amount', type: 'uint256' }
      ],
      [data.tokenAddress, data.amount]
    );

    actOnUnknownOpenAction({
      address: GOOD_DONATION,
      data: d,
      publicationId: params.publicationId
    });
  };

  return { isLoading, makeDonation, txHash, txId };
};

export default useActOnDonationOpenAction;
