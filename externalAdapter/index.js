const { Requester, Validator } = require('@chainlink/external-adapter')
const fs = require('fs');

// Define custom error scenarios for the API.
// Return true for the adapter to retry.
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
  }
}


const createRequest = (input, callback) => {
  // The Validator helps you validate the Chainlink request data
  let jobType, validator;
  switch(input.id) {
    case "e7fb2c89-29c6-47d0-96c6-ab4a04c2ea22":  jobType="extract"; 
                                                  validator = new Validator(input, CumstomParams.extract); 
                                                  const matchIndex = validator.validated.data.matchIndex; console.log('extract')
                                                  break;
    case "37fbf90b-7721-43a1-b91e-3726348bcfcc":  jobType="match";   
                                                  validator = new Validator(input, CumstomParams.match);  console.log('match')
                                                  break;   
  }
  console.log('id -' + input.id)
  console.log('t - ' + jobType)
  const jobRunID = validator.validated.id;
  const url = validator.validated.data.url;
  const regexp = validator.validated.data.regexp;




  // The Requester allows API calls be retry in case of timeout
  // or connection failure
  Requester.request(url, customError)
    .then(response => {
      let tempResArray=[];
      let resArray=[];
      let parseRegExp = Array.from(regexp.matchAll(/\/(.*)\/(.*)$/g));
      let clearRegExp = parseRegExp[0][1];
      let flags = parseRegExp[0][2];
      let re  = new RegExp(clearRegExp,flags)
      if(jobType == "extract") {
        
        const found = response.data.matchAll(re)
        
        Array.from(found, (res) => tempResArray.push(res[1]));
        if(input.data["matchIndex"] <= tempResArray.length) {
          resArray.push(tempResArray[input.data["matchIndex"]]);
        }
        else {
          resArray = tempResArray;
          
        }
    } 
    else {
      const re  = new RegExp(clearRegExp,flags)
      resArray.push(String(re.test(response.data)));
    }
      callback(response.status, {
        jobRunID,
        data: {"val":resArray},
        statusCode: response.status
      })
    })
    .catch(error => {
      callback(500, Requester.errored(jobRunID, error))
    })
}

// This is a wrapper to allow the function to work with
// GCP Functions
exports.gcpservice = (req, res) => {
  createRequest(req.body, (statusCode, data) => {
    res.status(statusCode).send(data)
  })
}

// This is a wrapper to allow the function to work with
// AWS Lambda
exports.handler = (event, context, callback) => {
  createRequest(event, (statusCode, data) => {
    callback(null, data)
  })
}

// This is a wrapper to allow the function to work with
// newer AWS Lambda implementations
exports.handlerv2 = (event, context, callback) => {
  createRequest(JSON.parse(event.body), (statusCode, data) => {
    callback(null, {
      statusCode: statusCode,
      body: JSON.stringify(data),
      isBase64Encoded: false
    })
  })
}

// This allows the function to be exported for testing
// or for running in express
module.exports.createRequest = createRequest
