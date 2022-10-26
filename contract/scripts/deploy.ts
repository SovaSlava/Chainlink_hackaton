import { GetDataFromSite, GetDataFromSite__factory } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import  hre  from "hardhat";
async function main() {
    let owner:SignerWithAddress;
    let getDataFromSite:GetDataFromSite;
    let chainlinkToken = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB"; // goerli
    let chainlinkOracle = "0xD2B084349963897762FA223b3C2B72AC0378Ccfd";
    let jobIdForExtract = ethers.utils.toUtf8Bytes("e7fb2c8929c647d096c6ab4a04c2ea22");
    let jobIdForMatch =   ethers.utils.toUtf8Bytes("37fbf90b772143a1b91e3726348bcfcc");
    [owner] = await ethers.getSigners();
    getDataFromSite = await new GetDataFromSite__factory(owner).deploy(chainlinkToken, chainlinkOracle, jobIdForExtract, jobIdForMatch);
    await getDataFromSite.deployed();
    console.log(`GetDataFromSite contract Address: ${getDataFromSite.address}`);
    await new Promise(r => setTimeout(r, 30000));
    await hre.run('verify:verify', {
      address: getDataFromSite.address,
      constructorArguments: [chainlinkToken, chainlinkOracle, jobIdForExtract, jobIdForMatch],
      contract: "contracts/GetDataFromSite.sol:GetDataFromSite"
    })


}

main()
  .then(() => process.exit(0)) 
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

