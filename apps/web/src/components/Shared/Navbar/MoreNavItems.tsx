import type { FC } from 'react';

import cn from '@good/ui/cn';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import {
  BookmarkIcon,
  CurrencyDollarIcon,
  EllipsisHorizontalCircleIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useProfileStore } from 'src/store/persisted/useProfileStore';

import MenuTransition from '../MenuTransition';
import MoreLink from './NavItems/MoreLink';
import Support from './NavItems/Support';

const MoreNavItems: FC = () => {
  const { currentProfile } = useProfileStore();

  return (
    <Menu as="div" className="relative">
      {({ open }) => (
        <>
          <MenuButton
            className={cn(
              'flex w-full cursor-pointer items-center space-x-2 rounded-md px-2 py-1 text-left text-sm tracking-wide md:px-3',
              {
                'bg-gray-200 text-black dark:bg-gray-800 dark:text-white': open,
                'text-white-700 dark:text-white-300 hover:bg-gray-200 hover:text-black dark:hover:bg-gray-800 dark:hover:text-white':
                  !open
              }
            )}
          >
            <EllipsisHorizontalCircleIcon className="size-8" />
            <a
              className="nav-text text-xl text-black dark:text-white"
              href="/donations"
              target="_blank"
            >
              More
            </a>
          </MenuButton>
          <MenuTransition>
            <MenuItems
              className="absolute bottom-0 left-0 mb-2 rounded-xl border bg-white shadow-sm focus:outline-none dark:border-gray-700 dark:bg-gray-900"
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
                    <MoreLink
                      href="/bookmarks"
                      icon={<BookmarkIcon className="size-4" />}
                      text="Bookmarks"
                    />
                  </MenuItem>
                  <MenuItem
                    as="div"
                    className={({ focus }: { focus: boolean }) =>
                      cn({ 'dropdown-active': focus }, 'm-2 rounded-lg')
                    }
                  >
                    <MoreLink
                      href="https://www.volunteerconnector.org/"
                      icon={<UserIcon className="size-4" />}
                      text="Volunteer"
                    />
                  </MenuItem>
                  <MenuItem>
                    <Menu as="div" className="relative m-2 rounded-lg">
                      {({ open }) => (
                        <>
                          <MenuButton
                            className={cn(
                              'flex w-full cursor-pointer items-center space-x-2 rounded-md px-2 py-1 text-left text-sm tracking-wide text-gray-700 hover:bg-gray-200 hover:text-black md:px-3 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white',
                              {
                                'text-gray-700 dark:text-gray-200': open,
                                'text-gray-700 hover:bg-gray-200 hover:text-black dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white':
                                  !open
                              }
                            )}
                          >
                            <CurrencyDollarIcon className="ml-[-1px] size-4" />
                            <span className="text-m text-black dark:text-white">
                              Donate
                            </span>
                          </MenuButton>
                          <MenuTransition>
                            <MenuItems>
                              <MenuItem
                                as="div"
                                className={({ focus }: { focus: boolean }) =>
                                  cn(
                                    { 'dropdown-active': focus },
                                    'm-2 rounded-lg'
                                  )
                                }
                              >
                                <MoreLink
                                  href="https://giveth.io"
                                  text="Giveth"
                                />
                              </MenuItem>
                              <MenuItem
                                as="div"
                                className={({ focus }: { focus: boolean }) =>
                                  cn(
                                    { 'dropdown-active': focus },
                                    'm-2 rounded-lg'
                                  )
                                }
                              >
                                <MoreLink
                                  href="https://thegivingblock.com"
                                  text="GivingBlock"
                                />
                              </MenuItem>
                              <MenuItem
                                as="div"
                                className={({ focus }: { focus: boolean }) =>
                                  cn(
                                    { 'dropdown-active': focus },
                                    'm-2 rounded-lg'
                                  )
                                }
                              >
                                <MoreLink
                                  href="https://gitcoin.co"
                                  text="Gitcoin"
                                />
                              </MenuItem>
                            </MenuItems>
                          </MenuTransition>
                        </>
                      )}
                    </Menu>
                  </MenuItem>
                  <div className="divider" />
                </>
              ) : null}
              <MenuItem
                as="div"
                className={({ focus }: { focus: boolean }) =>
                  cn({ 'dropdown-active': focus }, 'm-2 rounded-lg')
                }
              >
                <Support />
              </MenuItem>
            </MenuItems>
          </MenuTransition>
        </>
      )}
    </Menu>
  );
};

export default MoreNavItems;
