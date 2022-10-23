import { GetDataFromSite, GetDataFromSite__factory } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import  hre  from "hardhat";
async function main() {
    let owner:SignerWithAddress;
    let getDataFromSite:GetDataFromSite;
    let chainlinkToken = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB"; // goerli
    let chainlinkOracle = "0x68c7C58ADE6E0CA18325F62248dCe42c36633B4E";
    let jobIdForExtract = ethers.utils.toUtf8Bytes("3b16b512754146aba3f2205d77b51ea6");
    let jobIdForMatch =   ethers.utils.toUtf8Bytes("3b16b512754146aba3f2205d77b51ea6");
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

