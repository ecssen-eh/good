import hre from 'hardhat';

async function deployProxy() {
  const owner = '0xADDRESS';
  const feesBps = '500'; // 5%

  const GoodDonation = await hre.ethers.getContractFactory('GoodDonation');
  const deployProxy = await hre.upgrades.deployProxy(GoodDonation as any, [
    owner,
    feesBps
  ]);
  const contract = await deployProxy.deployed();

  console.log(`GoodDonation deployed to ${contract.address}`);

  await hre.run('verify:verify', {
    address: contract.address
  });
}

deployProxy().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
