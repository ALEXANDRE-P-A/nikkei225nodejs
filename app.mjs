import ip from "ip";
import express from "express";
import path from "path";
import cors from "cors";
import cron from "node-cron";

import { insertOne } from "./db/mongodb.mjs";
import { getLoadingFlag, getTradingDay, getS17, getS33, getStocks } from "./finance/j-quants.mjs";

import "./finance/j-quants.mjs";

const PORT  = 3000;

const app = express();
app.use(cors()); // Enables CORS for all routes and origins

// cron.schedule("*/15 * * * *", _ => {
//   const date = new Date();
//   const unixTimeStamp = Math.floor(date.getTime() / 1000);
//   console.log(unixTimeStamp);
//   insertOne("nikkei225", "marketTime", unixTimeStamp);
// });

app.get("/", async (req, res) => {
  const date = new Date(); // 現在のUTC日時
  const jstString = date.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });  // 例: 2024/4/1 18:00:00
  console.log(jstString);
  try {
    await insertOne("nikkei225", "accessHistory", { date: jstString, ip: req.ip });
  } catch(e) {
    console.log("ERROR when insert date & ip in DB");
    console.log(e);
  }; 
  res.json({ "app": "nikkei225app" });
});

app.get("/lastTradingDay", async (req, res) => {
  console.log(req.ip);
  if(getLoadingFlag())
    res.json({ "status": "loading" });
  else
    res.json({ "tradingDay": getTradingDay() })
});

app.get("/S17", async (req, res) => {
  if(getLoadingFlag())
    res.json({ "status": "loading" });
  else
    res.json(getS17());
});

app.get("/S33", async (req, res) => {
  if(getLoadingFlag())
    res.json({ "status": "loading" });
  else
    res.json(getS33());
});

app.get("/stocks", async (req, res) => {
  if(getLoadingFlag())
    res.json({ "status": "loading" });
  else
    res.json(getStocks());
});

app.listen(PORT, _ => {
  console.log(`App listening at port ${ip.address()}:${PORT}`);
});