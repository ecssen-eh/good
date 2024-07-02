import type { FC } from 'react';

import { NOTIFICATION } from '@good/data/tracking';
import { TabButton } from '@good/ui';
import { Leafwatch } from '@helpers/leafwatch';
import {
  AtSymbolIcon,
  BellIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  RectangleStackIcon
} from '@heroicons/react/24/outline';
import { NotificationTabType } from 'src/enums';

interface FeedTypeProps {
  feedType: NotificationTabType;
}

const FeedType: FC<FeedTypeProps> = ({ feedType }) => {
  const switchTab = (type: NotificationTabType) => {
    Leafwatch.track(NOTIFICATION.SWITCH_NOTIFICATION_TAB, {
      notification_type: type.toLowerCase()
    });
  };

  const tabs = [
    {
      icon: <BellIcon className="size-4" />,
      name: 'All notifications',
      type: NotificationTabType.All
    },
    {
      icon: <AtSymbolIcon className="size-4" />,
      name: 'Mentions',
      type: NotificationTabType.Mentions
    },
    {
      icon: <ChatBubbleLeftIcon className="size-4" />,
      name: 'Comments',
      type: NotificationTabType.Comments
    },
    {
      icon: <HeartIcon className="size-4" />,
      name: 'Likes',
      type: NotificationTabType.Likes
    },
    {
      icon: <RectangleStackIcon className="size-4" />,
      name: 'Collects',
      type: NotificationTabType.Collects
    }
  ];

  return (
    <div className="flex items-center justify-between">
      <div className="mt-3 flex gap-3 overflow-x-auto px-5 pb-2 sm:mt-0 sm:px-0 md:pb-0">
        {tabs.map((tab) => (
          <TabButton
            active={feedType === tab.type}
            icon={tab.icon}
            key={tab.type}
            name={tab.name}
            onClick={() => switchTab(tab.type)}
            type={tab.type.toLowerCase()}
          />
        ))}
      </div>
    </div>
  );
};

export default FeedType;
