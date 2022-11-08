import { AnyDataRequester, AnyDataRequester__factory } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import  hre  from "hardhat";
async function main() {
    let owner:SignerWithAddress;
    let GetAnyData:AnyDataRequester;
    let chainlinkToken = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB"; // goerli
    let chainlinkOracle = "0xD2B084349963897762FA223b3C2B72AC0378Ccfd";
    let jobIdForExtract = ethers.utils.toUtf8Bytes("e7fb2c8929c647d096c6ab4a04c2ea22");
    let jobIdForMatch =  ethers.utils.toUtf8Bytes("37fbf90b772143a1b91e3726348bcfcc");
    let jobIdForMultiExtract = ethers.utils.toUtf8Bytes("bede1e53f90f4f09a56e1da334aea84a");
    [owner] = await ethers.getSigners();
    GetAnyData = await new AnyDataRequester__factory(owner).deploy(chainlinkToken, chainlinkOracle, jobIdForExtract, jobIdForMatch, jobIdForMultiExtract);
    await GetAnyData.deployed();
    console.log(`GetAnyData contract Address: ${GetAnyData.address}`);
    await new Promise(r => setTimeout(r, 30000));
    await hre.run('verify:verify', {
      address: GetAnyData.address,
      constructorArguments: [chainlinkToken, chainlinkOracle, jobIdForExtract, jobIdForMatch, jobIdForMultiExtract],
      contract: "contracts/AnyDataRequester.sol:AnyDataRequester"
    })


}

main()
  .then(() => process.exit(0)) 
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

