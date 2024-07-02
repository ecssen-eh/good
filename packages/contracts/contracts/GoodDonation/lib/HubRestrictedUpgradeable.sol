// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';

import { Errors } from 'lens-modules/contracts/libraries/constants/Errors.sol';

/**
 * @title HubRestricted
 * @author Lens Protocol & BCharity
 *
 * @notice This abstract contract adds a public `HUB` field, as well as an `onlyHub` modifier,
 * to inherit from contracts that have functions restricted to be only called by the Lens hub. This contract
 * supports upgradeability.
 */
abstract contract HubRestrictedUpgradeable is Initializable {
  address private HUB;

  modifier onlyHub() {
    if (msg.sender != HUB) {
      revert Errors.NotHub();
    }
    _;
  }

  function initialize(address hub) internal onlyInitializing {
    HUB = hub;
  }
}
