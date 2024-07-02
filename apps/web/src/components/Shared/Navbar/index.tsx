import type { FC, ReactNode } from 'react';

import NavPost from '@components/Composer/Post/NavPost';
import Search from '@components/Search';
import cn from '@good/ui/cn';
import {
  BellIcon as BellIconOutline,
  CurrencyDollarIcon as CurrencyDollarIconOutline,
  EnvelopeIcon as EnvelopeIconOutline,
  HomeIcon as HomeIconOutline,
  MagnifyingGlassIcon as MagnifyingGlassIconOutline
} from '@heroicons/react/24/outline';
import {
  BellIcon as BellIconSolid,
  CurrencyDollarIcon as CurrencyIconSolid,
  EnvelopeIcon as EnvelopeIconSolid,
  HomeIcon as HomeIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { usePreferencesStore } from 'src/store/non-persisted/usePreferencesStore';
import { useFeatureFlagsStore } from 'src/store/persisted/useFeatureFlagsStore';
import { useProfileStore } from 'src/store/persisted/useProfileStore';
import styled from 'styled-components';

import LoginButton from '../LoginButton';
import MenuItems from './MenuItems';
import MobileLogoButton from './MobileLogoButton';
import ModIcon from './ModIcon';
import MoreNavItems from './MoreNavItems';
import SignupButton from './SignupButton';
import SiteStatus from './SiteStatus';
import StaffBar from './StaffBar';

const NavbarContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: 0;
  .nav-text,
  .auth-buttons {
  display: block;
}

@media (max-width: 1024px) {
    .nav-text,
    .auth-buttons {
    display: none;
  }
}

  .hide-on-mobile {
  display: block; 
}


@media (max-width: 760px) {
  .hide-on-mobile {
    display: none; 
  }
}


  .display-on-mobile {
  display: none; 
}

@media (max-width: 760px) {
    .display-on-mobile {
    display: flex; 
    }
  }

}


`;

const BottomButtonsContainer = styled.div`
  margin-top: 1rem;
  width: 100%;
`;

const PostButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background-color: #da5597;
  color: white;
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  font-size: 1.25rem;

  @media (max-width: 760px) {
    display: none;
  }
`;

const MobilePostButton = styled.button`
  display: none;

  @media (max-width: 760px) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: #da5597;
    color: white;
    width: 56px;
    height: 56px;
    position: fixed;
    bottom: 80px;
    right: 20px;
    z-index: 10;
    font-size: 2rem;
  }
`;

const Navbar: FC = () => {
  const { currentProfile } = useProfileStore();
  const { staffMode } = useFeatureFlagsStore();
  const { appIcon } = usePreferencesStore();
  const [showSearch, setShowSearch] = useState(false);
  const [isShortScreen, setIsShortScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsShortScreen(window.innerHeight < 500);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  interface NavItemProps {
    current: boolean;
    icon: ReactNode;
    name: string;
    target: any;
    url: string;
  }

  const NavItem: FC<NavItemProps> = ({ current, icon, name, target, url }) => {
    return (
      <Link
        className={cn(
          'mb-4 flex cursor-pointer items-start space-x-2 rounded-md px-2 py-1 hover:bg-gray-300/20 md:flex',
          {
            'bg-gray-200 text-black dark:bg-gray-800 dark:text-white': current,
            'text-gray-700 hover:bg-gray-200 hover:text-black dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white':
              !current
          }
        )}
        href={url}
        target={target ? '_blank' : '_self'}
      >
        {icon}
        <div className="nav-text text-black dark:text-white">
          <span className={`text-xl ${current ? 'font-bold' : ''}`}>
            {name}
          </span>
        </div>
      </Link>
    );
  };

  const NavItems = () => {
    const { pathname } = useRouter();
    return (
      <>
        <NavItem
          current={pathname === '/'}
          icon={
            pathname === '/' ? (
              <HomeIconSolid className="size-8" />
            ) : (
              <HomeIconOutline className="size-8" />
            )
          }
          name="Home"
          target={false}
          url="/"
        />
        <NavItem
          current={pathname === '/explore'}
          icon={
            pathname === '/explore' ? (
              <MagnifyingGlassIconSolid className="size-8" />
            ) : (
              <MagnifyingGlassIconOutline className="size-8" />
            )
          }
          name="Explore"
          target={false}
          url="/explore"
        />
        <NavItem
          current={pathname === '/notifications'}
          icon={
            pathname === '/notifications' ? (
              <BellIconSolid className="size-8" />
            ) : (
              <BellIconOutline className="size-8" />
            )
          }
          name="Notifications"
          target={false}
          url="/notifications"
        />
        <NavItem
          current={pathname === '/messages'}
          icon={
            pathname === '/messages' ? (
              <EnvelopeIconSolid className="size-8" />
            ) : (
              <EnvelopeIconOutline className="size-8" />
            )
          }
          name="Messages"
          target={false}
          url="/messages"
        />
        <NavItem
          current={pathname === '/donations'}
          icon={
            pathname === '/donations' ? (
              <CurrencyIconSolid className="size-8" />
            ) : (
              <CurrencyDollarIconOutline className="size-8" />
            )
          }
          name="Donations"
          target={true}
          url="/donations"
        />
        <MoreNavItems />
      </>
    );
  };

  return (
    <header className="sticky top-0 z-10 min-h-fit min-w-fit rounded-xl border bg-white dark:border-gray-700 dark:bg-black">
      <SiteStatus />
      {staffMode ? <StaffBar /> : null}
      <NavbarContainer className="container mx-auto w-full">
        <div className="relative flex h-full w-full flex-col items-start justify-start">
          <button
            className="hide-on-mobile inline-flex items-start justify-start rounded-md text-gray-500 focus:outline-none md:hidden"
            onClick={() => setShowSearch(!showSearch)}
            type="button"
          />
          <Link className="hide-on-mobile" href="/">
            <div className="text-white-900 inline-flex flex-grow items-start justify-start font-bold">
              <div className="ml-6 text-3xl font-black">
                <img alt="Logo" className="h-12 w-12" src="/logo1.svg" />
              </div>
              <span className="nav-text ml-3 mr-3 flex flex-grow">
                Goodcast
              </span>
            </div>
          </Link>

          <div className="display-on-mobile">
            <MobileLogoButton />
          </div>
          <div className="absolute" style={{ left: '-9999px', top: '-9999px' }}>
            <MenuItems />
          </div>

          <div className="hide-on-mobile max-h-[70vh] overflow-y-scroll pr-4 pt-5 sm:ml-6 md:block">
            <div className="relative flex h-fit flex-col items-start">
              <NavItems />
              <div className="mt-5 w-full">
                <NavPost />
                {!currentProfile ? <LoginButton /> : null}
                {!currentProfile ? <SignupButton /> : null}
                <div className="">
                  <Link
                    className={cn(
                      'max-h-[100vh] md:hidden',
                      !currentProfile?.id && 'ml-[60px]'
                    )}
                    href="/"
                  >
                    <img
                      alt="Logo"
                      className="size-7"
                      height={32}
                      src="/logo.png" //{`${STATIC_IMAGES_URL}/app-icon/${appIcon}.png`}
                      width={32}
                    />
                  </Link>
                  <div
                    className="mt-4 flex items-start justify-between"
                    id="profile"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hide-on-mobile ml-6 flex items-center gap-2">
          {currentProfile ? <MenuItems /> : null}
          <ModIcon />
        </div>
      </NavbarContainer>
      {showSearch ? (
        <div className="m-3 md:hidden">
          <Search />
        </div>
      ) : null}
    </header>
  );
};

export default Navbar;
