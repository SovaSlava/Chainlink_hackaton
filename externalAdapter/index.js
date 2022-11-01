import { Requester, Validator } from '@chainlink/external-adapter'
import * as IPFS from 'ipfs'
const node = await IPFS.create()
const customError = (data) => {
  if (data.Response === 'Error') return true
  return false
}

const CumstomParams = {
  "extract": { 
    url: true,
    regexp: true,
    matchIndex: true
  },
  "match": { 
    url: true,
    regexp: true
  },
  "multiExtract": { 
    url: true,
    regexp: true
  }
}


export const createRequest = async (input, callback) => {

  let jobType = input["jobType"];
  let validator;
  switch(jobType) {
    case "extract":                              validator = new Validator(input, CumstomParams.extract); 
                                                  const matchIndex = validator.validated.data.matchIndex; 
                                                  break;
    case "match":                                validator = new Validator(input, CumstomParams.match);  
                                                  break;   
    case "multiExtract":                          validator = new Validator(input, CumstomParams.multiExtract);  
                                                  break;  

  }
  
  const jobRunID = validator.validated.id;
  const url = validator.validated.data.url;
  const regexp = validator.validated.data.regexp;

  let response= {
    data:"",
    status:200
  };
  if(/^ipfs/.test(url)) {
    const ipfsUrlMatch = url.match(/:\/\/(.*)/)
 
    let stream = node.cat(ipfsUrlMatch[1])
  
    const decoder = new TextDecoder()
    try {
    for await (const chunk of stream) {
      response.data += decoder.decode(chunk, { stream: true })
    }
  }
  catch(error) {
    callback(500, Requester.errored(jobRunID, error))
  }

    //console.log('ipfs data - ' + response.data)
    //console.log('url ipfs')
  }
  else if(/^http/.test(url)){
    //console.log('url - http')
    await Requester.request(url, customError)
      .then(responseHttp => {
        response.data = responseHttp.data;
        response.status = responseHttp.status;
      })
      .catch(error => {
        callback(500, Requester.errored(jobRunID, error))
      // callback(500,  error)
      })

   
  }

  console.log('responseData - ' + JSON.stringify(response))
//////

//QmPChd2hVbrJ6bfo3WBcTW4iZnpHm8TEzWkLHmLpXhF68A



  // The Requester allows API calls be retry in case of timeout
  // or connection failure
console.log('jobType - ' + jobType)
     // console.log('js - ' + response.data)
      let tempResArray=[];
      let resArray=[];
      let parseRegExp = Array.from(regexp.matchAll(/\/(.*)\/(.*)$/g));
      let clearRegExp = parseRegExp[0][1];
      let flags = parseRegExp[0][2];
      let re  = new RegExp(clearRegExp,flags)
      if(jobType == "extract" || jobType=="multiExtract") {
        
        const found = response.data.matchAll(re)
        
        Array.from(found, (res) => tempResArray.push(res[1]));
        if(jobType=="extract" && input.data["matchIndex"] <= tempResArray.length) {
          resArray.push(tempResArray[input.data["matchIndex"]]);
        }
        else {
          resArray = tempResArray;
        
        }
        console.log(resArray)
    } 
    else if(jobType="match") {
      const re  = new RegExp(clearRegExp,flags)
      resArray.push(String(re.test(response.data)));
    }
    
      callback(response.status, {
        jobRunID,
        data: {"val":resArray},
        statusCode: response.status
      })
  
    }


// This allows the function to be exported for testing
// or for running in express
//module.exports.createRequest = createRequest
