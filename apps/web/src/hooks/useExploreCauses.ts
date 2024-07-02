import type { AnyPublication, Post } from '@good/lens';

import { GOOD_API_URL } from '@good/data/constants';
import { LimitType, usePublicationsLazyQuery } from '@good/lens';
import toEvenLengthHexString from '@helpers/toEvenLengthHexString';
import axios from 'axios';
import { useEffect, useState } from 'react';

const MAX_PUBLICATIONS_QUERY_BATCH = 50;

interface CauseMetadata {
  id: string;
  profileAddress: string;
  profileId: string;
  publicationId: string;
}

async function fetchAllCauses(): Promise<CauseMetadata[]> {
  const { data } = await axios.get(`${GOOD_API_URL}/donations/all-causes`);

  return data.causes;
}

function toLensPublicationId(
  profileId: string,
  publicationId: string
): `0x${string}-0x${string}` {
  return `${toEvenLengthHexString(profileId)}-${toEvenLengthHexString(publicationId)}`;
}

function isPostPublication(publication: AnyPublication): publication is Post {
  return publication.__typename === 'Post';
}

export interface UseExploreCausesReturn {
  data: Post[];
  error?: Error;
  fetchingMore: boolean;
  fetchMore: () => void;
  hasMore: boolean;
  loading: boolean;
}

export default function useExploreCauses(): UseExploreCausesReturn {
  const [causePostIds, setCausePostIds] = useState<string[]>([]);
  const [causePosts, setCausePosts] = useState<Post[]>([]);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const [cursor, setCursor] = useState(0);

  const [queryCausePublications, { fetchMore: fetchMoreCausePublications }] =
    usePublicationsLazyQuery();

  const fetchInitialCausePublications = async () => {
    setLoading(true);

    try {
      const causes = await fetchAllCauses();

      const causePostIds = causes.map((cause) =>
        toLensPublicationId(cause.profileId, cause.publicationId)
      );
      const ids = causePostIds.slice(
        cursor,
        cursor + MAX_PUBLICATIONS_QUERY_BATCH
      );

      const { data, error } = await queryCausePublications({
        variables: {
          request: {
            limit: LimitType.Fifty,
            where: { publicationIds: ids }
          }
        }
      });

      if (error || !data) {
        throw error;
      }

      const publications = data.publications.items as AnyPublication[];
      const posts = publications.filter(isPostPublication);

      setCausePostIds(causePostIds);
      setCausePosts(posts);
      setCursor(Math.min(cursor + MAX_PUBLICATIONS_QUERY_BATCH, causes.length));
    } catch (error) {
      if (error instanceof Error) {
        setError(error);
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialCausePublications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasMore = !!causePostIds && cursor < causePostIds.length;

  const fetchMore = async () => {
    if (!hasMore) {
      return;
    }

    setLoading(true);
    setFetchingMore(true);

    const ids = causePostIds.slice(
      cursor,
      cursor + MAX_PUBLICATIONS_QUERY_BATCH
    );

    try {
      const { data, error } = await fetchMoreCausePublications({
        variables: {
          request: {
            limit: LimitType.Fifty,
            where: { publicationIds: ids }
          }
        }
      });

      if (error) {
        throw error;
      }

      const publications = data.publications.items as AnyPublication[];
      const posts = publications.filter(isPostPublication);

      setCausePosts(causePosts.concat(posts));
      setCursor(
        Math.min(cursor + MAX_PUBLICATIONS_QUERY_BATCH, causePostIds.length)
      );
    } catch (error) {
      if (error instanceof Error) {
        setError(error);
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  };

  return {
    data: causePosts,
    error: error,
    fetchingMore: fetchingMore,
    fetchMore: fetchMore,
    hasMore: hasMore,
    loading: loading
  };
}
