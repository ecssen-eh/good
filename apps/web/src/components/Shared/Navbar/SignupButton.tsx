import type { FC } from 'react';

import { AUTH } from '@good/data/tracking';
import { Button } from '@good/ui';
import { Leafwatch } from '@helpers/leafwatch';
import { useGlobalModalStateStore } from 'src/store/non-persisted/useGlobalModalStateStore';

import { useSignupStore } from '../Auth/Signup';

const SignupButton: FC = () => {
  const { setShowAuthModal } = useGlobalModalStateStore();
  const { setScreen } = useSignupStore();

  return (
    <Button
      className={
        'mb-2 inline-flex w-10/12 items-center justify-center rounded-full border border-white bg-black p-2 text-base text-white sm:w-full'
      }
      onClick={() => {
        setScreen('choose');
        setShowAuthModal(true, 'signup');
        Leafwatch.track(AUTH.OPEN_SIGNUP);
      }}
      outline
      size="md"
    >
      Signup
    </Button>
  );
};

export default SignupButton;
