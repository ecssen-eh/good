import { ethers, run, upgrades } from 'hardhat';

async function upgradeActionModuleProxy() {
  const PROXY_ADDRESS = '0x03df64ebE8579b4ce89C261021cD22068E025aEc';

  const GoodDonationActionModule = await ethers.getContractFactory(
    'GoodDonationActionModule'
  );
  const contract = await upgrades.upgradeProxy(
    PROXY_ADDRESS,
    GoodDonationActionModule
  );

  await contract.deployed();

  console.log(`Proxy ${PROXY_ADDRESS} upgraded`);

  await run('verify:verify', {
    address: PROXY_ADDRESS
  });
}

upgradeActionModuleProxy().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
