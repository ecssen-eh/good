import type { Handler } from 'express';

import { APP_NAME, IS_MAINNET } from '@good/data/constants';
import LensEndpoint from '@good/data/lens-endpoints';
import logger from '@good/helpers/logger';
import axios from 'axios';
import catchedError from 'src/helpers/catchedError';
import { GOOD_USER_AGENT } from 'src/helpers/constants';
import validateIsStaff from 'src/helpers/middlewares/validateIsStaff';
import { notAllowed } from 'src/helpers/responses';

const FETCH_STATS_QUERY = `
query Publications($request: PublicationsRequest!, $countOpenActionsRequest2: PublicationStatsCountOpenActionArgs) {
  publications(request: $request) {
    items {
      ... on Post {
        __typename
        stats {
          reactions
          bookmarks
          collects: countOpenActions(request: $countOpenActionsRequest2)
          actions: countOpenActions
        }
      }
      ... on Comment {
        __typename
        stats {
          reactions
          bookmarks
          collects: countOpenActions(request: $countOpenActionsRequest2)
          actions: countOpenActions
        }
      }
      ... on Mirror {
        __typename
      }
      ... on Quote {
        __typename
        stats {
          bookmarks
          reactions
          collects: countOpenActions(request: $countOpenActionsRequest2)
          actions: countOpenActions
        }
      }
    }
    pageInfo {
      next
      prev
    }
  }
}
`;

async function fetchStatsBatch(cursor: string | undefined) {
  const getStatsQuery = {
    query: FETCH_STATS_QUERY,
    variables: {
      countOpenActionsRequest2: {
        anyOf: [
          {
            category: 'COLLECT'
          }
        ]
      },
      request: {
        cursor: cursor ?? null,
        where: {
          metadata: {
            publishedOn: APP_NAME
          }
        }
      }
    }
  };

  const { data } = await axios.post(
    IS_MAINNET ? LensEndpoint.Mainnet : LensEndpoint.Testnet,
    getStatsQuery,
    {
      headers: {
        'Content-Type': 'application/json',
        'User-agent': GOOD_USER_AGENT
      }
    }
  );

  const stats = {
    actions: 0,
    bookmarks: 0,
    collects: 0,
    comments: 0,
    mirrors: 0,
    publications: 0,
    quotes: 0,
    reactions: 0
  };

  for (const p of data.data.publications.items) {
    if (p.__typename === 'Post') {
      stats.publications++;
    } else if (p.__typename === 'Mirror') {
      stats.mirrors++;
    } else if (p.__typename === 'Comment') {
      stats.comments++;
    } else if (p.__typename === 'Quote') {
      stats.quotes++;
    }

    stats.reactions += p.stats.reactions;
    stats.bookmarks += p.stats.bookmarks;
    stats.collects += p.stats.collects;
    stats.actions += p.stats.actions;
  }

  const nextCursor: string | undefined = data.data.publications.pageInfo?.next;
  const prevCursor: string | undefined = data.data.publications.pageInfo?.prev;
  return { nextCursor, prevCursor, stats };
}

async function getAggregateStats() {
  const totals: Record<string, number> = {
    actions: 0,
    bookmarks: 0,
    collects: 0,
    comments: 0,
    mirrors: 0,
    publications: 0,
    quotes: 0,
    reactions: 0
  };

  let { nextCursor, prevCursor, stats } = await fetchStatsBatch();
  for (const [k, v] of Object.entries(stats)) {
    console.log(totals[k], v);
    totals[k] += v;
  }
  while (nextCursor) {
    try {
      let res = await fetchStatsBatch(nextCursor);
      nextCursor = res.nextCursor;
      for (const [k, v] of Object.entries(res.stats)) {
        console.log(totals[k], v);
        totals[k] += v;
      }
    } catch (error) {
      console.log(error);
      break;
    }
  }

  while (prevCursor) {
    try {
      let res = await fetchStatsBatch(prevCursor);
      prevCursor = res.prevCursor;
      for (const [k, v] of Object.entries(res.stats)) {
        totals[k] += v;
      }
    } catch (error) {
      console.log(error);
      break;
    }
  }

  return totals;
}

// TODO: add tests
export const get: Handler = async (req, res) => {
  const validateIsStaffStatus = await validateIsStaff(req);
  if (validateIsStaffStatus !== 200) {
    return notAllowed(res, validateIsStaffStatus);
  }

  try {
    const stats = await getAggregateStats();

    logger.info('Lens: Fetched publication stats');

    return res.status(200).json({ result: stats, success: true });
  } catch (error) {
    catchedError(res, error);
  }
};
