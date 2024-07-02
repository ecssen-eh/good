import type { FrameTransaction, Frame as IFrame } from '@good/types/misc';
import type { Dispatch, FC, SetStateAction } from 'react';

import { Errors } from '@good/data';
import { GOOD_API_URL } from '@good/data/constants';
import formatAddress from '@good/helpers/formatAddress';
import getNftChainId from '@good/helpers/getNftChainId';
import getNftChainInfo from '@good/helpers/getNftChainInfo';
import { Button } from '@good/ui';
import errorToast from '@helpers/errorToast';
import getAuthApiHeaders from '@helpers/getAuthApiHeaders';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useProfileStore } from 'src/store/persisted/useProfileStore';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  polygonAmoy,
  zora
} from 'viem/chains';
import { useSendTransaction, useSwitchChain } from 'wagmi';

const SUPPORTED_CHAINS = [
  polygon.id,
  polygonAmoy.id,
  optimism.id,
  arbitrum.id,
  mainnet.id,
  zora.id,
  base.id
];

interface TransactionProps {
  publicationId?: string;
  setFrameData: Dispatch<SetStateAction<IFrame | null>>;
  setShowTransaction: Dispatch<
    SetStateAction<{
      frame: IFrame | null;
      index: number;
      show: boolean;
      transaction: FrameTransaction | null;
    }>
  >;
  showTransaction: {
    frame: IFrame | null;
    index: number;
    show: boolean;
    transaction: FrameTransaction | null;
  };
}

const Transaction: FC<TransactionProps> = ({
  publicationId,
  setFrameData,
  setShowTransaction,
  showTransaction
}) => {
  const { currentProfile } = useProfileStore();
  const [isLoading, setIsLoading] = useState(false);
  const [txnHash, setTxnHash] = useState<`0x${string}` | null>(null);
  const { switchChainAsync } = useSwitchChain();
  const { sendTransactionAsync } = useSendTransaction({
    mutation: { onError: errorToast }
  });

  if (!showTransaction.frame || !showTransaction.transaction) {
    return null;
  }

  const txnData = showTransaction.transaction;
  const chainId = parseInt(txnData.chainId.replace('eip155:', ''));
  const chainData = {
    logo: getNftChainInfo(getNftChainId(chainId.toString())).logo,
    name: getNftChainInfo(getNftChainId(chainId.toString())).name
  };

  if (!SUPPORTED_CHAINS.includes(chainId as any)) {
    return <div className="m-5">Chain not supported</div>;
  }

  const onTransaction = async () => {
    if (!currentProfile) {
      return toast.error(Errors.SignWallet);
    }

    try {
      setIsLoading(true);

      await switchChainAsync({ chainId });
      const hash = await sendTransactionAsync({
        data: txnData.params.data,
        to: txnData.params.to,
        value: BigInt(txnData.params.value)
      });

      setTxnHash(hash);

      const { data: postedData }: { data: { frame: IFrame } } =
        await axios.post(
          `${GOOD_API_URL}/frames/post`,
          {
            buttonIndex: +1,
            postUrl:
              showTransaction.frame?.buttons[showTransaction.index].postUrl ||
              showTransaction.frame?.postUrl,
            pubId: publicationId
          },
          { headers: getAuthApiHeaders() }
        );

      if (!postedData.frame) {
        return toast.error(Errors.SomethingWentWrongWithFrame);
      }

      return setFrameData(postedData.frame);
    } catch {
      toast.error(Errors.SomethingWentWrongWithFrame);
    } finally {
      setIsLoading(false);
    }
  };

  if (txnHash) {
    return (
      <div className="m-8 flex flex-col items-center justify-center">
        <div className="text-xl font-bold">Transaction Sent</div>
        <div className="ld-text-gray-500 mt-3 text-center font-semibold">
          Your transaction will confirm shortly.
        </div>
        <CheckCircleIcon className="mx-auto mt-8 size-14" />
        <Button
          className="mt-5"
          onClick={async () => {
            if (!txnHash) {
              return null;
            }

            await navigator.clipboard.writeText(txnHash);
            toast.success('Transaction hash copied to clipboard!');
          }}
        >
          Copy transaction hash
        </Button>
      </div>
    );
  }

  return (
    <div className="m-5">
      <div>
        <div className="flex items-center justify-between gap-x-10">
          <b>Network</b>
          <span className="ld-text-gray-500 flex items-center gap-x-2 truncate">
            <img alt={chainData.name} className="size-4" src={chainData.logo} />
            <span>{chainData.name}</span>
          </span>
        </div>
        <div className="divider my-1" />
        <div className="flex items-center justify-between gap-x-10">
          <b>Account</b>
          <span className="ld-text-gray-500 truncate">
            {formatAddress(currentProfile?.ownedBy.address)}
          </span>
        </div>
      </div>
      <div className="mt-5 space-y-2">
        <Button
          className="w-full"
          disabled={isLoading}
          onClick={onTransaction}
          size="lg"
        >
          Submit
        </Button>
        <Button
          className="w-full"
          disabled={isLoading}
          onClick={() =>
            setShowTransaction({
              frame: null,
              index: 0,
              show: false,
              transaction: null
            })
          }
          outline
          size="lg"
          variant="danger"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default Transaction;
