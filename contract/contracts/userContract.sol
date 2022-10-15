// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import '@chainlink/contracts/src/v0.8/ChainlinkClient.sol';
import '@chainlink/contracts/src/v0.8/ConfirmedOwner.sol';


contract userContract is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    string public firstNewsTitle;
  

    bytes32 public jobId;
    uint256 public fee;




    constructor(address chainlinkToken, address chainlinkOracle, bytes32 jobid) ConfirmedOwner(msg.sender) {
        setChainlinkToken(chainlinkToken);
        setChainlinkOracle(chainlinkOracle);
        jobId = jobid;
        fee = (1 * LINK_DIVISIBILITY) / 10; // 0,1 * 10**18 (Varies by network and job)
    }

    function requestData() public returns (bytes32 requestId) {
        Chainlink.Request memory req = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        req.add("url", "https://chain.link/press");
        req.add("regexp", 'h3-newstitle">(.*?)<');
        return sendChainlinkRequest(req, fee);
    }


    function fulfill(
        bytes32 _requestId,
        string[] memory result
    ) public recordChainlinkFulfillment(_requestId) {
        firstNewsTitle = result[0];
    }

    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(link.transfer(msg.sender, link.balanceOf(address(this))), 'Unable to transfer');
    }
}
