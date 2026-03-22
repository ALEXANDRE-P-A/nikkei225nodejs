import ip from "ip";
import express from "express";
import cors from "cors";
import cron from "node-cron";

import { run, getCollection, findOne, insertOne, insertMany, updateOne, reset } from "./db/mongodb.mjs";
import { marketTime } from "./finance/yahoo-finance.mjs";

const PORT  = 3000;

const app = express();
app.use(cors()); // Enables CORS for all routes and origins

const updateStocks = async _ => {
  const dbname = "nikkei225";
  const colName = "marketTime";
  const docName = "marketTime";
  const doc = await findOne(dbname, colName, docName);
  const marketUnixTimeStamp = await marketTime();

  if(doc === null){ // if market time is not inserted in mongodb
    const result = await insertOne(dbname, colName, { name: docName, value: marketUnixTimeStamp });
    if(result.acknowledged)
      console.log("market time is inserted successfully...");
    else
      console.log("error in insert market time ...");
  } else if(doc && (doc.value === marketUnixTimeStamp)){ // if latest market time is already in mongodb
    console.log("market time is already updated ...");
  } else if(doc && (doc.value !== marketUnixTimeStamp)){ // if market time is not updated in mongodb
    const result = await updateOne("nikkei225", colName, docName, marketUnixTimeStamp);
    if(result.acknowledged)
      console.log("market time is updated successfully...");
    else
      console.log("error in updated market time ...");
  }
};

// cron.schedule("*/15 * * * *", _ => {
//   const date = new Date();
//   const unixTimeStamp = Math.floor(date.getTime() / 1000);
//   console.log(unixTimeStamp);
//   insertOne("nikkei225", "marketTime", unixTimeStamp);
// });

updateStocks();

app.get("/",(req, res) => {
  res.json({ "app": "nikkei225app" });
});

app.listen(PORT, _ => {
  console.log(`App listening at port ${ip.address()}:${PORT}`);
});