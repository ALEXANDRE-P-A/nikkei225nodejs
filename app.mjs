import ip from "ip";
import express from "express";
import cors from "cors";
import cron from "node-cron";

import { findOne, insertOne, insertMany, updateOne, reset } from "./db/mongodb.mjs";
import { marketTime, allSectors, allStocksData } from "./finance/yahoo-finance.mjs";

import "./finance/j-quants.mjs";

const PORT  = 3000;

const app = express();
app.use(cors()); // Enables CORS for all routes and origins

const getTickers = async _ => {
  const dbname = "nikkei225";
  const colName = "tickers";
  const docName = "tickers";
  const result = await findOne(dbname, colName, docName);
  return result;
};

const updateStocks = async _ => {
  const dbname = "nikkei225";
  const colName = "marketTime";
  const docName = "marketTime";
  const doc = await findOne(dbname, colName, docName);
  const marketUnixTimeStamp = await marketTime();

  if(doc === null){ // if market time is not inserted in mongodb
    const result = await insertOne(dbname, colName, { name: docName, value: marketUnixTimeStamp });
    if(result.acknowledged){
      console.log("market time is inserted successfully...");
      const result = await getTickers();
      // console.log(result.tickers);
    } else
      console.log("error in insert market time ...");
  } else if(doc && (doc.value === marketUnixTimeStamp)){ // if latest market time is already in mongodb
    console.log("market time is already updated ...");
  } else if(doc && (doc.value !== marketUnixTimeStamp)){ // if market time is not updated in mongodb
    const marketTimeUpdateResult = await updateOne("nikkei225", colName, docName, marketUnixTimeStamp);
    if(marketTimeUpdateResult.acknowledged){
      console.log("market time is updated successfully...");
      const tickers = await getTickers();
      const stocksResetResult = await reset(dbname, "stocks")
      if(stocksResetResult.acknowledged){
        console.log("stocks is reseted successfully...");
        const stocksArray = await allStocksData(tickers.tickers);
        const stocksInsertResult = await insertMany(dbname, "stocks", stocksArray);
        if(stocksInsertResult){
          console.log("stocks is inserted successfully...");
        } else {
          console.log("error in insert stocks ...");
        }
      } else {
        console.log("error in reset stocks ...");
      }
    } else
      console.log("error in updated market time ...");
  }
};

const init = async _ => {
  const result = await getTickers();
  const stocksArray = await allStocksData(result.tickers);
  console.log(stocksArray);
};

// init();
// updateStocks();

// cron.schedule("*/15 * * * *", _ => {
//   const date = new Date();
//   const unixTimeStamp = Math.floor(date.getTime() / 1000);
//   console.log(unixTimeStamp);
//   insertOne("nikkei225", "marketTime", unixTimeStamp);
// });

app.get("/",(req, res) => {
  res.json({ "app": "nikkei225app" });
});

app.get("/sectors",async (req, res) => {
  const result = await getTickers();
  const sectors = await allSectors(result.tickers);
  res.json(sectors);
});

app.listen(PORT, _ => {
  console.log(`App listening at port ${ip.address()}:${PORT}`);
});