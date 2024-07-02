import type { Donation } from '@components/Donations/DonationPost';
import type { FC } from 'react';

import DonatorCard from '@components/Donations/DonatorCard';
import { EmptyState } from '@good/ui';
import { GiftIcon } from '@heroicons/react/24/outline';

interface DonationModalProps {
  donations: Donation[];
  onClose: () => void;
}

const DonationModal: FC<DonationModalProps> = ({ donations, onClose }) => {
  // Calculate the total amount donated
  const totalAmountDonated = donations.reduce(
    (total, donation) => total + Number(donation.amount),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Donations</h2>
          <button
            className="text-gray-500 hover:text-gray-800"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <div className="flex space-x-4">
          <div className="w-1/2 overflow-y-auto" style={{ maxHeight: '300px' }}>
            {donations.length > 0 ? (
              donations.map((donation) => (
                <DonatorCard donation={donation} key={donation.id} />
              ))
            ) : (
              <EmptyState
                icon={<GiftIcon className="size-8" />}
                message="Be the first one to donate!"
              />
            )}
          </div>
          <div className="flex w-1/2 flex-col justify-between">
            <div>
              <p className="text-lg">
                Total Amount Donated:{' '}
                <span className="font-semibold">
                  {totalAmountDonated} Tokens
                </span>
              </p>
              <p className="text-lg">
                Goal: <span className="font-semibold">$5,000 USD</span>
              </p>
            </div>
            <button className="mt-4 rounded-full bg-indigo-500 px-4 py-2 text-white">
              Donation Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationModal;
