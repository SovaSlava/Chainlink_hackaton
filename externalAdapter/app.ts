import { createRequest } from './index.js'
import express from "express";
import { Express, Request, Response } from 'express';
const app: Express = express()
const port = process.env.EA_PORT || 8080
type callbackType = {
  jobRunID: string,
  data: {
    result: string | string[] | boolean,
    requestStatus: number
  }
}

app.use(express.json())

app.post('/', (req: Request, res: Response) => {
  console.log('New request')

  createRequest(req.body, (callbackData: callbackType) => {
    console.log('Send response')
    res.status(200).json(callbackData)
  })

})

app.listen(port, () => console.log(`Listening on port ${port}!`))
