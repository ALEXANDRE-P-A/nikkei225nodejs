import ip from "ip";
import express from "express";
import cors from "cors";
import cron from "node-cron";

import { run, getCollection, find, insertOne, insertMany, update, reset } from "./db/mongodb.mjs";
import { marketTime } from "./finance/yahoo-finance.mjs";

const PORT  = 3000;

const app = express();
app.use(cors()); // Enables CORS for all routes and origins

// run();
// getCollection("nikkei225", "stocks");
// insertMany("nikkei225", "stocks");
// update("nikkei225", "stocks");
// reset("nikkei225", "stocks");
// find("nikkei225", "stocks");

// marketTime();

cron.schedule("*/15 * * * *", _ => {
  const date = new Date();
  const unixTimeStamp = Math.floor(date.getTime() / 1000);
  console.log(unixTimeStamp);
  insertOne("nikkei225", "marketTime", unixTimeStamp);
});

// reset("nikkei225", "marketTime");

app.get("/",(req, res) => {
  res.json({ "app": "nikkei225app" });
});

app.listen(PORT, _ => {
  console.log(`App listening at port ${ip.address()}:${PORT}`);
});