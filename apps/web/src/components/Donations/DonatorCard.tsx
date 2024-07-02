import type { Donation } from '@components/Donations/DonationPost';
import type { Profile } from '@good/lens';
import type { FC } from 'react';

import SmallUserProfileShimmer from '@components/Shared/Shimmer/SmallUserProfileShimmer';
import getAvatar from '@good/helpers/getAvatar';
import getProfile from '@good/helpers/getProfile';
import { useProfileQuery } from '@good/lens';
import { ErrorMessage, Image } from '@good/ui';
import toEvenLengthHexString from '@helpers/toEvenLengthHexString';
import { useReadContract } from 'wagmi';

interface DonationCardProps {
  donation: Donation;
}

const ERC20_SYMBOL_ABI = [
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        name: '',
        type: 'string'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  }
] as const;

const DonatorCard: FC<DonationCardProps> = ({ donation }) => {
  const {
    data: profileData,
    error: profileError,
    loading: profileLoading
  } = useProfileQuery({
    variables: {
      request: {
        forProfileId: toEvenLengthHexString(donation.fromProfileId)
      }
    }
  });

  const { data: tokenSymbol, error: tokenSymbolError } = useReadContract({
    abi: ERC20_SYMBOL_ABI,
    address: donation.tokenAddress as `0x${string}`,
    args: [],
    functionName: 'symbol'
  });

  if (profileLoading) {
    return (
      <div className="my-3">
        <SmallUserProfileShimmer />
      </div>
    );
  }

  if (profileError) {
    return <ErrorMessage error={profileError} title="Failed to load profile" />;
  }

  if (tokenSymbolError) {
    console.error(
      `Failed to load token symbol for ${donation.tokenAddress}: ${tokenSymbolError}`
    );
  }

  const profile = getProfile(profileData?.profile as Profile);
  const avatar = getAvatar(profileData?.profile);

  return (
    <div className="mb-4 flex items-center">
      <Image
        alt={profile.displayName}
        className="mr-4 h-10 w-10 rounded-full"
        height={10}
        src={avatar}
        width={10}
      />
      <div>
        <p className="text-sm font-semibold">{profile.displayName}</p>
        <p className="text-sm text-gray-500">
          Just Donated {donation.amount} {tokenSymbol ?? '???'}
        </p>
      </div>
    </div>
  );
};

export default DonatorCard;
