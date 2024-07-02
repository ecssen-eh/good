import type { Handler } from 'express';

import { APP_NAME, IS_MAINNET } from '@good/data/constants';
import LensEndpoint from '@good/data/lens-endpoints';
import logger from '@good/helpers/logger';
import axios from 'axios';
import catchedError from 'src/helpers/catchedError';
import { GOOD_USER_AGENT } from 'src/helpers/constants';
import validateIsStaff from 'src/helpers/middlewares/validateIsStaff';
import { notAllowed } from 'src/helpers/responses';

const APP_PUBLICATION_COLLECTS_QUERY = `
query AppPublicationCollects($request: PublicationsRequest!) {
  publications(request: $request) {
    pageInfo {
      next
      prev
    }
    items {
      ... on Comment {
        openActionModules {
          ... on SimpleCollectOpenActionSettings {
            amount {
              value
              asset {
                ... on Erc20 {
                  name
                  symbol
                }
              }
            }
          }
          ... on MultirecipientFeeCollectOpenActionSettings {
            amount {
              value
              asset {
                ... on Erc20 {
                  name
                  symbol
                }
              }
            }
          }
        }
        stats {
          countOpenActions
        }
        createdAt
      }
      ... on Post {
        openActionModules {
          ... on SimpleCollectOpenActionSettings {
            amount {
              value
              asset {
                ... on Erc20 {
                  name
                  symbol
                }
              }
            }
          }
          ... on MultirecipientFeeCollectOpenActionSettings {
            amount {
              value
              asset {
                ... on Erc20 {
                  name
                  symbol
                }
              }
            }
          }
        }
        stats {
          countOpenActions
        }
        createdAt
      }
    }
  }
}
`;

interface AppPublicationCollectsQueryData {
  publications: {
    items: {
      createdAt: string;
      openActionModules: {
        amount: {
          asset: {
            name: string;
            symbol: string;
          };
          value: string;
        };
      }[];
      stats: {
        countOpenActions: number;
      };
    }[];
    pageInfo: {
      next: null | string;
      prev: null | string;
    };
  };
}

interface CurrencyRevenueInfo {
  revenue: number;
  symbol: string;
}

async function fetchAppPublicationCollectsRevenue(
  cursor: null | string,
  startingDate: Date
): Promise<{
  nextCursor: null | string;
  prevCursor: null | string;
  reachedStartingDate: boolean;
  revenue: Record<string, CurrencyRevenueInfo>;
}> {
  const fetchAppPublicationCollectsQuery = {
    query: APP_PUBLICATION_COLLECTS_QUERY,
    variables: {
      request: {
        cursor: cursor ?? null,
        where: {
          metadata: {
            publishedOn: APP_NAME
          },
          withOpenActions: [
            {
              category: 'COLLECT'
            }
          ]
        }
      }
    }
  };

  const { data } = await axios.post(
    IS_MAINNET ? LensEndpoint.Mainnet : LensEndpoint.Testnet,
    fetchAppPublicationCollectsQuery,
    {
      headers: {
        'Content-Type': 'application/json',
        'User-agent': GOOD_USER_AGENT
      }
    }
  );

  const { publications } = data.data as AppPublicationCollectsQueryData;
  const { next: nextCursor, prev: prevCursor } = publications.pageInfo;
  const publicationCollects = publications.items;

  // Force stop iterating through the cursors when there is a circular reference.
  // For some reason, when there are no more values, the Lens API returns the
  // previous cursor.
  if (publicationCollects.length == 0) {
    return {
      nextCursor: null,
      prevCursor: null,
      reachedStartingDate: false,
      revenue: {}
    };
  }

  const currencyRevenues: Record<string, CurrencyRevenueInfo> = {};

  for (const collect of publicationCollects) {
    // Lens API randomly returning empty values??
    if (Object.keys(collect).length === 0) {
      continue;
    }

    const creationDate = new Date(collect.createdAt);

    if (creationDate < startingDate) {
      // Lens API seems to return entries in the order of most recent to oldest.
      // So all entries past this one are irrelevant (too old).
      return {
        nextCursor: nextCursor,
        prevCursor: prevCursor,
        reachedStartingDate: true,
        revenue: currencyRevenues
      };
    }

    const collectCount = collect.stats.countOpenActions;

    if (collectCount === 0) {
      continue;
    }

    const collectModules = collect.openActionModules;

    // Sometimes the API returns a collect module with no statistics?
    const collectModule =
      Object.keys(collectModules[0]).length !== 0
        ? collectModules[0]
        : collectModules[1];

    const value = Number(collectModule.amount.value);
    const { name, symbol } = collectModule.amount.asset;

    if (isNaN(value) || value === 0) {
      continue;
    }

    const revenue = value * collectCount;
    const storedRevenue = currencyRevenues[name];

    if (storedRevenue === undefined) {
      currencyRevenues[name] = {
        revenue: revenue,
        symbol: symbol
      };

      continue;
    }

    storedRevenue.revenue += revenue;
  }

  return {
    nextCursor: nextCursor,
    prevCursor: prevCursor,
    reachedStartingDate: false,
    revenue: currencyRevenues
  };
}

async function fetchAppRevenue() {
  const currentDate = new Date();
  const startingDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );

  let { nextCursor, prevCursor, revenue } =
    await fetchAppPublicationCollectsRevenue(null, startingDate);

  const totalRevenues = revenue;

  while (nextCursor) {
    try {
      const result = await fetchAppPublicationCollectsRevenue(
        nextCursor,
        startingDate
      );

      for (const [tokenName, revenueInfo] of Object.entries(result.revenue)) {
        const existingRevenue = totalRevenues[tokenName];

        if (existingRevenue === undefined) {
          totalRevenues[tokenName] = revenueInfo;
          continue;
        }

        existingRevenue.revenue += revenueInfo.revenue;
      }

      // Results past this point are outside of the current month and year
      if (result.reachedStartingDate) {
        break;
      }

      nextCursor = result.nextCursor;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('Failed to retrieve publication collects', error);
      }
    }
  }

  while (prevCursor) {
    try {
      const result = await fetchAppPublicationCollectsRevenue(
        prevCursor,
        startingDate
      );

      for (const [tokenName, revenueInfo] of Object.entries(result.revenue)) {
        const existingRevenue = totalRevenues[tokenName];

        if (existingRevenue === undefined) {
          totalRevenues[tokenName] = revenueInfo;
          continue;
        }

        existingRevenue.revenue += revenueInfo.revenue;
      }

      prevCursor = result.prevCursor;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('Failed to retrieve publication collects', error);
      }
    }
  }

  const formattedTotalRevenues = [];

  for (const [tokenName, revenueInfo] of Object.entries(totalRevenues)) {
    formattedTotalRevenues.push({
      currency: tokenName,
      month: currentDate.getMonth(),
      revenue: revenueInfo.revenue,
      symbol: revenueInfo.symbol
    });
  }

  return formattedTotalRevenues.sort((a, b) => b.revenue - a.revenue);
}

// TODO: add tests
export const get: Handler = async (req, res) => {
  const validateIsStaffStatus = await validateIsStaff(req);
  if (validateIsStaffStatus !== 200) {
    return notAllowed(res, validateIsStaffStatus);
  }

  try {
    const result = await fetchAppRevenue();

    logger.info('Lens: Fetched app revenue');

    return res.status(200).json({ result, success: true });
  } catch (error) {
    catchedError(res, error);
  }
};
