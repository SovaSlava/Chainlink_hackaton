const { Requester, Validator } = require('@chainlink/external-adapter')

// Define custom error scenarios for the API.
// Return true for the adapter to retry.
const customError = (data) => {
  if (data.Response === 'Error') return true
  return false
}

const customParams = {
  url: true,
  type: true,
  regexp: true,
  flags: false

}

const createRequest = (input, callback) => {
  console.log('i1 - ' + JSON.stringify(input))
  // The Validator helps you validate the Chainlink request data
  const validator = new Validator(input, customParams)
  const jobRunID = validator.validated.id;
  const url = validator.validated.data.url;
//  const type = validator.validated.data.type;
//  const regexp = validator.validated.data.regexp;
//  const flags = validator.validated.data.flags;



  // This is where you would add method and headers
  // you can add method like GET or POST and add it to the config
  // The default is GET requests
  // method = 'get' 
  // headers = 'headers.....'
  const config = "https://google.com"

  // The Requester allows API calls be retry in case of timeout
  // or connection failure
  Requester.request(url, customError)
    .then(response => {
      console.log(response.data)
      // It's common practice to store the desired value at the top-level
      // result key. This allows different adapters to be compatible with
      // one another.
   //  response.data.result = Requester.validateResultNumber(response.data, [tsyms])
      callback(response.status, {
        jobRunID,
        data: {"val":33},
        //data: response.data,
        //result: "privete",
        statusCode: response.status
      })
      //  callback(response.status, Requester.success(jobRunID, response))
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
