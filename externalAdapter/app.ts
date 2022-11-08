import  { createRequest } from './index.js'
import express from "express";
import  {  Express, Request, Response} from 'express';
import { create }  from "ipfs"
const app:Express = express()
const port = process.env.EA_PORT || 8080
const node = await create();
type callbackType = {
  jobRunID:string,
  data:{ result: string | string[] | boolean,
         requestStatus: number
  }
}

app.use(express.json())

app.post('/', (req:Request, res:Response) => {
  console.log(`Request data: ${req.body}`)
 
  createRequest(node, req.body, (callbackData:callbackType) => {
    res.status(200).json(callbackData)
  })
  
})

app.listen(port, () => console.log(`Listening on port ${port}!`))
