import { ethers, run, upgrades } from 'hardhat';

async function deployProxy() {
  const owner = '0xADDRESS';
  const lensHub = '0xADDRESS';

  const GoodDonation = await ethers.getContractFactory('GoodDonationV2');
  const deployProxy = await upgrades.deployProxy(GoodDonation, [
    owner,
    owner,
    lensHub
  ]);
  const contract = await deployProxy.deployed();

  console.log(`GoodDonationV2 deployed to ${contract.address}`);

  await run('verify:verify', {
    address: contract.address
  });
}

deployProxy().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// 0xA6A26C724c59A40e5203c17fe88a1e3EAA70717d
