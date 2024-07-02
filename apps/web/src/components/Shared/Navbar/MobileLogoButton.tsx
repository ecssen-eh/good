import type { FC, ReactNode } from 'react';

import cn from '@good/ui/cn';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import {
  BellIcon as BellIconOutline,
  EnvelopeIcon as EnvelopeIconOutline,
  HomeIcon as HomeIconOutline,
  MagnifyingGlassIcon as MagnifyingGlassIconOutline
} from '@heroicons/react/24/outline';
import {
  BellIcon as BellIconSolid,
  EnvelopeIcon as EnvelopeIconSolid,
  HomeIcon as HomeIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { useProfileStore } from 'src/store/persisted/useProfileStore';

import LoginButton from '../LoginButton';
import MenuTransition from '../MenuTransition';
import MoreNavItems from './MoreNavItems';
import SignedUser from './SignedUser';
import SignupButton from './SignupButton';

interface NavItemProps {
  current: boolean;
  icon: ReactNode;
  name: string;
  url: string;
}

const NavItem: FC<NavItemProps> = ({ current, icon, name, url }) => {
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
    >
      {icon}
      <div className="nav-text text-black dark:text-white">
        <span className={`text-xl ${current ? 'font-bold' : ''}`}>{name}</span>
      </div>
    </Link>
  );
};

const MobileLogoButton: React.FC = () => {
  const { currentProfile } = useProfileStore();
  const { pathname } = useRouter();

  return (
    <Menu as="div" className="relative">
      {({ open }) => (
        <>
          <MenuButton
            className={cn(
              'text-white-900 inline-flex flex-grow items-start justify-start font-bold',
              {
                'bg-gray-200 text-black dark:bg-gray-800 dark:text-white': open,
                'text-white-700 dark:text-white-300 hover:bg-gray-200 hover:text-black dark:hover:bg-gray-800 dark:hover:text-white':
                  !open
              }
            )}
          >
            <div className="pl-6 text-3xl font-black">
              <img alt="Logo" className="h-12 w-12" src="/logo1.svg" />
            </div>
            <span className="nav-text ml-3 mr-3 flex flex-grow">Goodcast</span>
          </MenuButton>
          <MenuTransition>
            <MenuItems
              className="absolute mb-2 min-w-max rounded-xl border bg-white shadow-sm focus:outline-none dark:border-gray-700 dark:bg-gray-900"
              //className=" absolute mb-2 rounded-xl border bg-white shadow-sm focus:outline-none dark:border-gray-700 dark:bg-gray-900"
              static
            >
              {currentProfile ? (
                <>
                  <MenuItem
                    as="div"
                    className={({ focus }: { focus: boolean }) =>
                      cn({ 'dropdown-active': focus }, 'm-2 rounded-lg')
                    }
                  >
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
                      url="/"
                    />
                  </MenuItem>
                  <MenuItem
                    as="div"
                    className={({ focus }: { focus: boolean }) =>
                      cn({ 'dropdown-active': focus }, 'm-2 rounded-lg')
                    }
                  >
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
                      url="/explore"
                    />
                  </MenuItem>
                  <MenuItem
                    as="div"
                    className={({ focus }: { focus: boolean }) =>
                      cn({ 'dropdown-active': focus }, 'm-2 rounded-lg')
                    }
                  >
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
                      url="/notifications"
                    />
                  </MenuItem>
                  <div className="divider" />
                  <MenuItem
                    as="div"
                    className={({ focus }: { focus: boolean }) =>
                      cn({ 'dropdown-active': focus }, 'm-2 rounded-lg')
                    }
                  >
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
                      url="/messages"
                    />
                  </MenuItem>
                  <MenuItem
                    as="div"
                    className={({ focus }: { focus: boolean }) =>
                      cn({ 'dropdown-active': focus }, 'm-2 rounded-lg')
                    }
                  >
                    <MoreNavItems />
                  </MenuItem>
                </>
              ) : null}

              <MenuItem
                as="div"
                className={({ focus }: { focus: boolean }) =>
                  cn({ 'dropdown-active': focus }, 'm-2 rounded-lg')
                }
              >
                {!currentProfile ? <LoginButton /> : null}
              </MenuItem>
              <MenuItem
                as="div"
                className={({ focus }: { focus: boolean }) =>
                  cn({ 'dropdown-active': focus }, 'm-2 rounded-lg')
                }
              >
                {!currentProfile ? <SignupButton /> : null}
              </MenuItem>
              <div className="ml-2">
                {currentProfile ? <SignedUser /> : null}
              </div>
            </MenuItems>
          </MenuTransition>
        </>
      )}
    </Menu>
  );
};

export default MobileLogoButton;
