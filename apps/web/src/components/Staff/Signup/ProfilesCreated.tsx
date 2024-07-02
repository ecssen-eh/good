import type { FC } from 'react';

import { GoodLensSignup } from '@good/abis';
import { GOOD_LENS_SIGNUP } from '@good/data/constants';
import { NumberedStat } from '@good/ui';
import { useReadContract } from 'wagmi';

const ProfilesCreated: FC = () => {
  const { data: totalProfilesCreated } = useReadContract({
    abi: GoodLensSignup,
    address: GOOD_LENS_SIGNUP,
    functionName: 'totalProfilesCreated',
    query: { refetchInterval: 2000 }
  });

  return (
    <NumberedStat
      count={totalProfilesCreated?.toString() || '0'}
      name="Total Profiles"
      suffix="Profiles"
    />
  );
};

export default ProfilesCreated;
