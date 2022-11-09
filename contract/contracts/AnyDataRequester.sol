// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

contract AnyDataRequester is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    // Results
    bool public matchTextResult;
    string public extractTextResult;
    string[] public multipliExtractTextResult;
    uint public lastResponseStatus;
    bytes32 public jobIdForExtract;
    bytes32 public jobIdForMatch;
    bytes32 public jobIdForMultiExtract;
    uint256 public fee;

    event RequestError(bytes32 requestId, uint requestStatus);

    modifier checkResponseStatus(bytes32 requestId, uint responseStatus) {
        lastResponseStatus = responseStatus;
        if (responseStatus == 0) {
            _;
        }
        // else.. request failed and we analizy error
        else if (responseStatus == 1) {
            emit RequestError(requestId, 1);
        } else if (responseStatus == 2) {
            emit RequestError(requestId, 2);
        }
    }

    constructor(
        address chainlinkToken,
        address chainlinkOracle,
        bytes32 _jobIdForExtract,
        bytes32 _jobIdForMatch,
        bytes32 _jobIdForMultiExtract
    ) ConfirmedOwner(msg.sender) {
        setChainlinkToken(chainlinkToken);
        setChainlinkOracle(chainlinkOracle);
        jobIdForExtract = _jobIdForExtract;
        jobIdForMatch = _jobIdForMatch;
        jobIdForMultiExtract = _jobIdForMultiExtract;
        fee = (1 * LINK_DIVISIBILITY) / 10; // 0,1 * 10**18 (Varies by network and job)
    }

    function extractText(
        string calldata url,
        string calldata regexp,
        string calldata matchIndex
    ) external {
        Chainlink.Request memory req = buildChainlinkRequest(
            jobIdForExtract,
            address(this),
            this.fulfillExtract.selector
        );
        req.add("url", url);
        req.add("regexp", regexp);
        req.add("matchIndex", matchIndex);
        // Example:
        //req.add("url", "https://chain.link/press");
        //req.add("regexp", '/h3-newstitle">(.*?)</gim');
        //req.add("matchIndex", matchIndex); //start from 0
        sendChainlinkRequest(req, fee);
    }

    function multiExtractText(string calldata url, string calldata regexp)
        external
    {
        Chainlink.Request memory req = buildChainlinkRequest(
            jobIdForMultiExtract,
            address(this),
            this.fulfillMultiExtract.selector
        );
        req.add("url", url);
        req.add("regexp", regexp);
        // Example:
        //req.add("url", "https://chain.link/press");
        //req.add("regexp", '/h3-newstitle">(.*?)</gim');
        sendChainlinkRequest(req, fee);
    }

    function isTextMatch(string calldata url, string calldata regexp) external {
        Chainlink.Request memory req = buildChainlinkRequest(
            jobIdForMatch,
            address(this),
            this.fulfillMatch.selector
        );
        req.add("url", url);
        req.add("regexp", regexp);
        // Example:
        //req.add("url", "https://chain.link/press");
        //req.add("regexp", "/Latest\\snews\\sabout\\sChainlink/gim");
        sendChainlinkRequest(req, fee);
    }

    function fulfillExtract(
        bytes32 _requestId,
        uint _requestStatus,
        string memory _result
    )
        external
        recordChainlinkFulfillment(_requestId)
        checkResponseStatus(_requestId, _requestStatus)
    {
        extractTextResult = _result;
    }

    function fulfillMultiExtract(
        bytes32 _requestId,
        uint _requestStatus,
        bytes memory _result
    )
        external
        recordChainlinkFulfillment(_requestId)
        checkResponseStatus(_requestId, _requestStatus)
    {
        multipliExtractTextResult = abi.decode(_result, (string[]));
    }

    function fulfillMatch(
        bytes32 _requestId,
        uint _requestStatus,
        bool _result
    )
        external
        recordChainlinkFulfillment(_requestId)
        checkResponseStatus(_requestId, _requestStatus)
    {
        matchTextResult = _result;
    }

    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(
            link.transfer(msg.sender, link.balanceOf(address(this))),
            "Unable to transfer"
        );
    }

    function clearResults() external onlyOwner {
        matchTextResult = false;
        extractTextResult = "";
        lastResponseStatus = 0;
        delete multipliExtractTextResult;
    }
}
