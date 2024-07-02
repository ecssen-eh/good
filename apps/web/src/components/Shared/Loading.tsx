import type { FC } from 'react';

import isPrideMonth from '@good/helpers/isPrideMonth';

import PageMetatags from './PageMetatags';

const Loading: FC = () => {
  const logoSrc = isPrideMonth() ? '/pride.png' : '/logo.png';

  return (
    <div className="grid h-screen place-items-center">
      <PageMetatags />
      <img
        alt="Logo"
        className="size-28"
        height={112}
        src={logoSrc}
        width={112}
      />
    </div>
  );
};

export default Loading;
