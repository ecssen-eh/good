import PublicationsShimmer from '@components/Shared/Shimmer/PublicationsShimmer';
import { EmptyState, ErrorMessage } from '@good/ui';
import { HeartIcon } from '@heroicons/react/24/outline';
import { Virtuoso } from 'react-virtuoso';
import useExploreCauses from 'src/hooks/useExploreCauses';

import DonationPost from './DonationPost';

const DonationsFeed = () => {
  const {
    data: posts,
    error,
    fetchingMore,
    fetchMore,
    loading
  } = useExploreCauses();

  if (loading && !fetchingMore) {
    return <PublicationsShimmer />;
  }

  if (error) {
    return <ErrorMessage error={error} title="Failed to load causes" />;
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        icon={<HeartIcon className="size-8" />}
        message="No causes yet!"
      />
    );
  }

  return (
    <Virtuoso
      data={posts}
      endReached={fetchMore}
      itemContent={(index, post) => {
        return (
          <DonationPost
            index={index}
            key={post.id}
            length={posts.length}
            post={post}
          />
        );
      }}
      useWindowScroll
    />
  );
};

export default DonationsFeed;
