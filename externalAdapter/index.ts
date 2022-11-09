import { Requester, Validator } from '@chainlink/ea-bootstrap'
const customError = (data: string) => {
  return false
}
type callbackType = {
  jobRunID: string,
  data: {
    result: string | string[] | boolean,
    requestStatus: number
  }
}
const CustomParams = {
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

const errorStatus = {
  "connectError": 1,
  "regexpError": 2
};

type defaultArgsTypes = {
  "match": boolean,
  "extract": string,
  "multiExtract": string[]
};
const defaultArgs: defaultArgsTypes = {
  "match": false,
  "extract": "",
  "multiExtract": []
};
type jobTypeArg = "match" | "extract" | "multiExtract";
export const createRequest = async (
  input: {
    "jobType": jobTypeArg,
    "jobRunID": string,
    "data": { matchIndex: string }
  },
  callback: (
    callbackData: callbackType
  ) => void) => {
  let receivedData: boolean = false;
  const jobType: string = input["jobType"];
  let matchIndex: string;
  let validator = new Validator(input, CustomParams[input["jobType"]]);
  if (jobType == "extract") {
    matchIndex = validator.validated.data.matchIndex;
  }


  const jobRunID: string = validator.validated.id;
  let url = validator.validated.data.url;
  const regexp = validator.validated.data.regexp;

  let response = {
    data: ""
  };

  if (/^ipfs/.test(url)) {
    const ipfsUrlMatch = url.match(/:\/\/(.*)/)
    url = `https://cloudflare-ipfs.com/ipfs/${ipfsUrlMatch[1]}`;
  }

  await Requester.request(url, customError)
    .then(responseHttp => {
      response.data = responseHttp.data;
      receivedData = true;
    })
    .catch(error => {
      callback({ jobRunID, data: { requestStatus: errorStatus.connectError, result: defaultArgs[jobType as keyof defaultArgsTypes] } })
    })


  if (typeof response.data == "object") {
    response.data = JSON.stringify(response.data);
  }

  let tempResArray: string[] = [];
  let resArray: string[] = [];
  let parseRegExp: string[][];
  let clearRegExp: string;
  let flags: string;
  let re: RegExp = /./;
  let regexpOK: boolean = false;
  try {
    parseRegExp = Array.from(regexp.matchAll(/\/(.*)\/(.*)$/g));
    clearRegExp = parseRegExp[0][1];
    flags = parseRegExp[0][2];
    re = new RegExp(clearRegExp, flags)
    regexpOK = true;
  }
  catch (error) {
    callback({ jobRunID, data: { requestStatus: errorStatus.regexpError, result: defaultArgs[jobType as keyof defaultArgsTypes] } })
  }
  if (regexpOK && receivedData) {
    if (jobType == "extract" || jobType == "multiExtract") {
      const found = response.data.matchAll(re)
      Array.from(found, (res) => tempResArray.push(res[1]));
      if (jobType == "extract") {
        if (Number(input.data["matchIndex"]) < tempResArray.length) {
          resArray.push(tempResArray[Number(input.data["matchIndex"])]);
        }
      }
      else {
        resArray = tempResArray;

      }

      callback({ jobRunID, data: { requestStatus: 0, result: resArray } })
    }
    else if (jobType == "match") {
      callback({ jobRunID, data: { requestStatus: 0, result: re.test(response.data) } })
    }
  }
}

