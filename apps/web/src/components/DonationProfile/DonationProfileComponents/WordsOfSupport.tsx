import type { Profile } from '@good/lens';

import getAvatar from '@good/helpers/getAvatar';
import { Image } from '@good/ui';
import { Button } from '@headlessui/react';
import React, { useState } from 'react';

interface WordsOfSupportProps {
  amount: number[];
  description: string[];
  supporters: Profile[];
}

const WordsOfSupport: React.FC<WordsOfSupportProps> = ({
  amount,
  description,
  supporters
}) => {
  const [showAllSupporters, setShowSupports] = useState(false);

  const maxLength = Math.min(
    supporters.length,
    amount.length,
    description.length
  );

  const handleShowAllSupporters = () => {
    setShowSupports(true);
  };

  return (
    <div className="-top-10 items-center justify-center rounded">
      <div className="mb-5 text-lg">Words of Support:</div>
      {Array.from(
        { length: showAllSupporters ? supporters.length : maxLength },
        (_, index) => (
          <div className="supporter-details flex flex-col" key={index}>
            <div className="flex">
              <Image
                alt={supporters[index]?.id}
                className="size-12 cursor-pointer rounded-full border dark:border-gray-700"
                src={getAvatar(supporters[index])}
              />
              <div className="mb-5 ml-4">
                <p>{supporters[index]?.handle?.localName}</p>
                <p>${amount[index]}</p>
                <p className="description">{description[index]}</p>
              </div>
            </div>
          </div>
        )
      )}
      {!showAllSupporters && (
        <div className="mt-5 flex items-center justify-center">
          <Button
            className="w-1/3 items-center justify-center rounded-full px-4 py-2 text-lg text-white"
            onClick={handleShowAllSupporters}
            style={{ background: '#da5597' }}
          >
            Show All
          </Button>
        </div>
      )}
    </div>
  );
};

export default WordsOfSupport;
