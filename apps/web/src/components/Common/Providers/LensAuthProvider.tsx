import type { FC } from 'react';

import { useVerifyQuery } from '@good/lens';
import getCurrentSession from '@helpers/getCurrentSession';
import { hydrateAuthTokens } from 'src/store/persisted/useAuthStore';

const LensAuthProvider: FC = () => {
  const { id } = getCurrentSession();
  const { accessToken } = hydrateAuthTokens();

  useVerifyQuery({
    pollInterval: 8000,
    skip: !id,
    variables: { request: { accessToken } }
  });

  return null;
};

export default LensAuthProvider;
