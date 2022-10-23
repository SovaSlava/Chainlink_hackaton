// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import '@chainlink/contracts/src/v0.8/ChainlinkClient.sol';
import '@chainlink/contracts/src/v0.8/ConfirmedOwner.sol';


contract GetDataFromSite is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    string public matchTextResult;
    string public extractTextResult;
    // requestId => type
    mapping(bytes32 => uint) public typeOfRequest; // 0: extract, 1: match
    

    bytes32 public jobIdForExtract;
    bytes32 public jobIdForMatch;
    uint256 public fee;





    constructor(
        address chainlinkToken, 
        address chainlinkOracle, 
        bytes32 _jobIdForExtract, 
        bytes32 _jobIdForMatch
        ) ConfirmedOwner(msg.sender) {
        setChainlinkToken(chainlinkToken);
        setChainlinkOracle(chainlinkOracle);
        jobIdForExtract = _jobIdForExtract;
        jobIdForMatch = _jobIdForMatch;
        fee = (1 * LINK_DIVISIBILITY) / 10; // 0,1 * 10**18 (Varies by network and job)
    }

    function extractText(
        string calldata url,
        string calldata regexp,
        string calldata matchIndex
        ) public {
        Chainlink.Request memory req = buildChainlinkRequest(jobIdForExtract, address(this), this.fulfill.selector);
        req.add("url", url);
        req.add("regexp", regexp);
        req.add("matchIndex", matchIndex);
        // Example:
        //req.add("url", "https://chain.link/press");
        //req.add("regexp", '/h3-newstitle">(.*?)</gim');
        //req.add("matchIndex", matchIndex); //start from 0
        bytes32 requestId = sendChainlinkRequest(req, fee);
        typeOfRequest[requestId] = 0; // extract
    }

    function isTextMatch(
        string calldata url,
        string calldata regexp
    ) public {
        Chainlink.Request memory req = buildChainlinkRequest(jobIdForMatch, address(this), this.fulfill.selector);
        req.add("url", url);
        req.add("regexp", regexp);
        // Example:
        //req.add("url", "https://chain.link/press");
        //req.add("regexp", "/Latest\\snews\\sabout\\sChainlink/gim");
        bytes32 requestId = sendChainlinkRequest(req, fee);
        typeOfRequest[requestId] = 1; // match
    }

    function fulfill(
        bytes32 _requestId,
        string[] memory result
    ) public recordChainlinkFulfillment(_requestId) {
        if(typeOfRequest[_requestId] == 0) {
            // result of extract job
            extractTextResult = result[0];
        }
        else if(typeOfRequest[_requestId] == 1) {
            // result of mathch job
            matchTextResult = result[0];
        }
    }

    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(link.transfer(msg.sender, link.balanceOf(address(this))), 'Unable to transfer');
    }
}
