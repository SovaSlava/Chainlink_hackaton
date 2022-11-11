## Inspiration
Sometimes, smart contracts need to data from websites, but some of them don't have neccessary api. Or contract need to part of non-json ipfs file. I think Its hinders web3 development.
## What it does
Any data requester - is external adapter for chainlink node, which give you opportunity to get any data from web sites or ipfs file. Its possible, because you can use regular expressions for getting information. 
There are 3 type of requests:
1. extract one text - you have to pass matchIndex parameter for cases, if result of matches will have more than one match of regulax expression. 
2. extract all data(multiMatch), which match with regular expression.
3. get true/false result for question-if text from website or ipfs contain data, which match to regular expression.

And, if you make mistake in url or regexp, you will get response anyway. And can understand, where was mistake, because each response from external adapter hash status.
It is 0, if response complete without erros.
1 - if url is unreachable
2 - if regular express has error
3 - no such index in array of matched text (only for multiMatch type)

## How we built it
I launch own chainlink node in goerli network on vps for testing external adapter. And use hardhat for writing smart contract. Also write external adapter's code.
## Challenges we ran into
Writting errors handlers for cornen cases, converting string array to bytes for passing in contract.
## Accomplishments that we're proud of
Accomplishments that we're proud of tool, which brings opportunity get any data from web2 sites and ipfs. 
## What we learned
How launch chainlink node, describe jobs, how external adapters work.
## What's next for Any data requester
* Next feature could be getting any data from tor. 
* Use own ipfs node instance 
* Add feature, which allow replace part of matched data, using external adapter. 

## How to use it
Contract in goerli - https://goerli.etherscan.io/address/0x49d042d1f5933C6322568DD140241B9730ab98c5
#### Get second headline from chainlink press page
Use function "extractText"
* url - https://chain.link/press/
* regexp - /h3-newstitle\">(.*?)</gim
* matchIndex - 1 (because it starts from 0)
Wait about 1 minute.. and you can read extracted data using function extractTextResult 

#### Get all sections's names  from docs.openzeppelin.com
Use function "multiExtractText"
* url - https://docs.openzeppelin.com/
* regexp - /card-title\">(.*?)</span/gim
Wait about 1 minute.. and you can read extracted data using function multipliExtractTextResult

#### If ipfs file contains word with part "EDU" 
Use function isTextMatch
* url - ipfs://QmSc6z1migCZKy9npZ4SjxQ5XPqeTqPL3qwgJweeJaYTwv
* regexp - /EDU/gim

For clearing all results and status, call clearResults function

## How to run adapter
```
cd externalAdapter
docker build . -t adapter
docker run -d --restart=on-failure -p 8080:8080 -it adapter:latest 
```
Jobs descriptions you can find in file jobsDescriptions.txt 
You should change oracle address in job descriptions to you own oracle address.
