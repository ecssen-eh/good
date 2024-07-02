import type { Image as LensImage, Profile } from '@good/lens';

import getAvatar from '@good/helpers/getAvatar';
import getLennyURL from '@good/helpers/getLennyURL';
import { Image } from '@good/ui';
import React from 'react';
import styled from 'styled-components';

interface DonationInfoProps {
  mission: string;
  organizer?: null | Profile;
  update: string;
  updateDate?: Date;
  updateImages?: (LensImage | string)[];
}

const DonationInfoContainer = styled.div`
  margin-bottom: 20px;
`;

const DonationInfo: React.FC<DonationInfoProps> = ({
  mission,
  organizer,
  update,
  updateDate,
  updateImages
}) => {
  const formatMission = (mission: string) => {
    return mission.replace(/\. /g, '.');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const Avatar = () => (
    <Image
      alt={organizer?.id}
      className="size-12 cursor-pointer rounded-full border dark:border-gray-700"
      onError={({ currentTarget }) => {
        currentTarget.src = getLennyURL(organizer?.id);
      }}
      src={getAvatar(organizer as Profile)}
    />
  );

  return (
    <DonationInfoContainer className="items-center justify-center">
      <div className="missionText">
        <div className="mb-3 flex text-lg text-gray-500 dark:text-white">
          <Avatar />
          <span className="m-auto ml-5 text-center">
            {organizer?.handle?.localName} is organizing this fundraiser
          </span>
        </div>

        <div className="mb-3 text-lg text-gray-500 dark:text-white">
          Mission:
        </div>
        <div
          className="mb-3"
          dangerouslySetInnerHTML={{ __html: formatMission(mission) }}
        />
      </div>

      <div className="updatesContainer">
        <div className="updatesText mb-5">
          <div className="mb-3 text-lg text-gray-500 dark:text-white">
            Updates:
          </div>
          {updateDate && <div className="mb-3">{formatDate(updateDate)}</div>}
          <div>{update}</div>
        </div>
        {updateImages && updateImages.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {updateImages.map((image, index) => (
              <img
                alt={`Image ${index + 1}`}
                className="h-auto w-full rounded-lg"
                key={index}
                src={typeof image === 'string' ? image : image.uri}
              />
            ))}
          </div>
        )}
      </div>
    </DonationInfoContainer>
  );
};

export default DonationInfo;
