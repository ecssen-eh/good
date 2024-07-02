import type { FC } from 'react';

import { APP_NAME } from '@good/data/constants';
import { MISCELLANEOUS } from '@good/data/tracking';
import cn from '@good/ui/cn';
import { Leafwatch } from '@helpers/leafwatch';
import Link from 'next/link';
import { useFeatureFlagsStore } from 'src/store/persisted/useFeatureFlagsStore';
import urlcat from 'urlcat';

const currentYear = new Date().getFullYear();

const links = [
  { href: '/terms', label: 'Terms' },
  { href: '/privacy', label: 'Privacy' },
  {
    href: 'https://bcharity.net/discord',
    label: 'Discord',
    onClick: () => Leafwatch.track(MISCELLANEOUS.FOOTER.OPEN_DISCORD)
  },
  {
    href: 'https://status.bcharity.net',
    label: 'Status',
    onClick: () => Leafwatch.track(MISCELLANEOUS.FOOTER.OPEN_STATUS)
  },
  {
    href: 'https://feedback.bcharity.net',
    label: 'Feedback',
    onClick: () => Leafwatch.track(MISCELLANEOUS.FOOTER.OPEN_FEEDBACK)
  },
  { href: '/rules', label: 'Rules' },
  {
    href: 'https://github.com/heyxyz/hey',
    label: 'GitHub',
    onClick: () => Leafwatch.track(MISCELLANEOUS.FOOTER.OPEN_GITHUB)
  },
  { href: '/support', label: 'Support' }
];

const Footer: FC = () => {
  const { staffMode } = useFeatureFlagsStore();

  return (
    <footer className={cn(staffMode ? 'top-28' : 'top-20', 'sticky text-sm')}>
      <div className="mt-4 flex flex-wrap gap-x-[12px] gap-y-2 px-3 lg:px-0">
        <span className="ld-text-gray-500 font-bold">
          &copy; {currentYear} {APP_NAME}
        </span>
        <Link className="outline-offset-4" href="/terms">
          Terms
        </Link>
        <Link className="outline-offset-4" href="/privacy">
          Privacy
        </Link>
        <Link
          className="outline-offset-4"
          href="https://discord.com/invite/NPeA8FJwye"
          onClick={() => Leafwatch.track(MISCELLANEOUS.FOOTER.OPEN_DISCORD)}
          rel="noreferrer noopener"
          target="_blank"
        >
          Discord
        </Link>
        <Link
          className="outline-offset-4"
          href="https://status.bcharity.net"
          onClick={() => Leafwatch.track(MISCELLANEOUS.FOOTER.OPEN_STATUS)}
          rel="noreferrer noopener"
          target="_blank"
        >
          Status
        </Link>
        <Link
          className="outline-offset-4"
          href="https://feedback.bcharity.net"
          onClick={() => Leafwatch.track(MISCELLANEOUS.FOOTER.OPEN_FEEDBACK)}
          rel="noreferrer noopener"
          target="_blank"
        >
          Feedback
        </Link>
        <Link className="outline-offset-4" href="/rules">
          Rules
        </Link>
        <Link
          className="outline-offset-4"
          href="https://github.com/bcharity-net/good"
          onClick={() => Leafwatch.track(MISCELLANEOUS.FOOTER.OPEN_GITHUB)}
          rel="noreferrer noopener"
          target="_blank"
        >
          GitHub
        </Link>
        <Link className="outline-offset-4" href="/support">
          Support
        </Link>
      </div>
      <div className="mt-4">
        <Link
          className="outline-offset-4 hover:font-bold focus:font-bold"
          href={urlcat('https://vercel.com', {
            utm_campaign: 'oss',
            utm_source: APP_NAME
          })}
          onClick={() => Leafwatch.track(MISCELLANEOUS.FOOTER.OPEN_VERCEL)}
          rel="noreferrer noopener"
          target="_blank"
        >
          ▲ Powered by Vercel
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
