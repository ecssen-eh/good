import type { Handler } from 'express';
import type { Address } from 'viem';

import {
  GOOD_MEMBERSHIP_NFT_PUBLICATION_ID,
  IS_MAINNET
} from '@good/data/constants';
import LensEndpoint from '@good/data/lens-endpoints';
import logger from '@good/helpers/logger';
import axios from 'axios';
import catchedError from 'src/helpers/catchedError';
import { CACHE_AGE_INDEFINITE, GOOD_USER_AGENT } from 'src/helpers/constants';
import { noBody } from 'src/helpers/responses';
import { getAddress } from 'viem';

const fetchPublications = async (id: any, addr: any) => {
  const { data } = await axios.post(
    IS_MAINNET ? LensEndpoint.Mainnet : LensEndpoint.Testnet,
    {
      query: `
    query Post($whoActedOnPublicationRequest2: WhoActedOnPublicationRequest!) {
  whoActedOnPublication(request: $whoActedOnPublicationRequest2) {
    items {
      id
      ownedBy {
        address
      }
    }
    pageInfo {
      next
      prev
    }
  }
}
  `,
      variables: {
        whoActedOnPublicationRequest2: {
          // cursor: null,
          on: GOOD_MEMBERSHIP_NFT_PUBLICATION_ID
        }
      }
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'User-agent': GOOD_USER_AGENT
      }
    }
  );
  console.log(data);
  let res = false;

  if (data.data.whoActedOnPublication.items) {
    const temp = data.data.whoActedOnPublication.items;
    // console.log(temp);
    for (const item of temp) {
      // console.log(item);
      // console.log(item.ownedBy.address);
      if (item.id === id || item.ownedBy.address === addr) {
        res = true;
        break;
      }
    }
    // console.log(res)
    if (res) {
      return true;
    }

    if (data.data.whoActedOnPublication.pageInfo.next) {
      let { next } = data.data.whoActedOnPublication.pageInfo;

      const endTime = Date.now() + 5000;
      while (next && Date.now() < endTime) {
        // console.log(next)
        const { data } = await axios.post(
          IS_MAINNET ? LensEndpoint.Mainnet : LensEndpoint.Testnet,
          {
            query: `
          query Post($whoActedOnPublicationRequest2: WhoActedOnPublicationRequest!) {
          whoActedOnPublication(request: $whoActedOnPublicationRequest2) {
            items {
              id
              ownedBy {
                address
              }
            }
            pageInfo {
              next
              prev
            }
          }
        }
        `,
            variables: {
              whoActedOnPublicationRequest2: {
                cursor: next,
                on: GOOD_MEMBERSHIP_NFT_PUBLICATION_ID
              }
            }
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'User-agent': GOOD_USER_AGENT
            }
          }
        );

        if (data.data.whoActedOnPublication.items) {
          const temp = data.data.whoActedOnPublication.items;
          // console.log(temp);
          for (const item of temp) {
            if (item.id === id || item.ownedBy.address === addr) {
              res = true;
              break;
            }
          }
          if (res) {
            return true;
          }
        }

        if (data.data.whoActedOnPublication.pageInfo.next) {
          next = data.data.whoActedOnPublication.pageInfo.next;
          // console.log(next)
        } else {
          return false;
        }
      }
      return res;
    } else {
      return false;
    }
  } else {
    return false;
  }
};

export const get: Handler = async (req, res) => {
  const { address, id } = req.query;

  if (!id && !address) {
    return noBody(res);
  }

  try {
    const formattedAddress = address
      ? getAddress(address as Address)
      : undefined;

    const response: any = await fetchPublications(id, formattedAddress);

    if (!response) {
      return res.status(200).json({ hasGoodNft: false, success: true });
    }
    const hasGoodNft = response;

    logger.info(`Good NFT badge fetched for ${id || formattedAddress}`);

    return res
      .status(200)
      .setHeader(
        'Cache-Control',
        hasGoodNft ? CACHE_AGE_INDEFINITE : 'no-cache'
      )
      .json({ hasGoodNft, success: true });
  } catch (error: any) {
    logger.error(`Error fetching Good NFT badge for ${id}: ${error.message}`);
    return catchedError(res, error);
  }
};
