import { Requester, Validator } from '@chainlink/ea-bootstrap'
import { create }  from "ipfs"
const customError = (data:string) => {
  return false
}
type callbackType = {
  jobRunID:string,
  data:{ result: string | string[] | boolean,
         requestStatus: number
  }
}
const CustomParams =  {
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
  "extract":"",
  "multiExtract":[]
};
type jobTypeArg = "match" | "extract" | "multiExtract";
export const createRequest = async (
  ipfsNode:Awaited<ReturnType<typeof create>>, 
  input:{
    "jobType":jobTypeArg, 
    "jobRunID":string, 
    "data":{matchIndex:string}
  }, 
  callback:(
    callbackData:callbackType
  ) => void) => {
  let receivedData:boolean=false;
  const jobType:string = input["jobType"];
  let matchIndex:string;
  let validator =  new Validator(input, CustomParams[input["jobType"]]); 
  if(jobType == "extract") {
    matchIndex = validator.validated.data.matchIndex; 
  }  

  
  const jobRunID:string = validator.validated.id ;
  const url = validator.validated.data.url;
  const regexp = validator.validated.data.regexp;

  let response= {
    data:""
  };
  if(/^ipfs/.test(url)) {
    const ipfsUrlMatch = url.match(/:\/\/(.*)/)
 
    let stream = ipfsNode.cat(ipfsUrlMatch[1])
  
    const decoder = new TextDecoder()
    try {
    for await (const chunk of stream) {
      response.data += decoder.decode(chunk, { stream: true })
    }
    receivedData=true;
  }
  catch(error) {
   callback({jobRunID, data: { requestStatus:errorStatus.connectError, result:defaultArgs[jobType as keyof defaultArgsTypes] } })
  }

  }
  else if(/^http/.test(url)){
    await Requester.request(url, customError)
      .then(responseHttp => {
        response.data = responseHttp.data;
        receivedData=true;
      })
      .catch(error => {
        callback({jobRunID, data: { requestStatus:errorStatus.connectError, result:defaultArgs[jobType as keyof defaultArgsTypes] }} )
      })

   
  }


console.log('jobType - ' + jobType)


  let tempResArray:string[]=[];
      let resArray:string[]=[];
      let parseRegExp:string[][];
      let clearRegExp:string;
      let flags:string;
      let re: RegExp=/./;
      let regexpOK:boolean=false;
      try {
      parseRegExp = Array.from(regexp.matchAll(/\/(.*)\/(.*)$/g));
      clearRegExp = parseRegExp[0][1];
      flags = parseRegExp[0][2];
      re = new RegExp(clearRegExp,flags)
      regexpOK = true;
      }
      catch(error) {
        callback({ jobRunID, data: { requestStatus:errorStatus.regexpError, result:defaultArgs[jobType as keyof defaultArgsTypes] } } )
      }
      if(regexpOK && receivedData) {
        if(jobType == "extract" || jobType=="multiExtract") {
        
        const found = response.data.matchAll(re)
        console.log('found = ' + JSON.stringify(found))
        Array.from(found, (res) => tempResArray.push(res[1]));
        console.log('tempResArray - ' + JSON.stringify(tempResArray))
        if(jobType=="extract") {
          console.log('tempResArray.length - ' + tempResArray.length)
          if(Number(input.data["matchIndex"]) < tempResArray.length) {
            resArray.push(tempResArray[Number(input.data["matchIndex"])]);
          }
        } 
        else {
          resArray = tempResArray;
        
        }
        console.log('resArray' + JSON.stringify(resArray))

        callback({ jobRunID, data: { requestStatus:0, result:resArray } } )
    } 
    else if(jobType=="match") {
      callback({ jobRunID, data: { requestStatus:0, result:re.test(response.data) } } )
      }
    }
  }
    
