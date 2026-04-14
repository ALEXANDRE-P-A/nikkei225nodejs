import { fileURLToPath } from "node:url";
import ip from "ip";
import express from "express";
import path from "path";
import cors from "cors";
import cron from "node-cron";

import { insertOne } from "./db/mongodb.mjs";
import { main, getLoadingFlag, getTradingDay, getS17, getS33, getStocks } from "./finance/j-quants.mjs";

import "./finance/j-quants.mjs";

const PORT  = 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors()); // Enables CORS for all routes and origins
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/static", express.static(path.join(__dirname, "nikkei225reactapp", "static")));
app.use("/", express.static(path.join(__dirname, "nikkei225reactapp")));

cron.schedule("5 45 17 * * 1-5", _ => {
  main();
});

app.get("/", async (req, res) => {
  const date = new Date(); // 現在のUTC日時
  const jstString = date.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });  // 例: 2024/4/1 18:00:00
  try {
    await insertOne("nikkei225", "accessHistory", { date: jstString, ip: req.ip });
  } catch(e) {
    console.log("ERROR when insert date & ip in DB");
    console.log(e);
  }; 
  res.sendFile(path.join(__dirname, "nikkei225reactapp", "index.html"));
});

app.get("/lastTradingDay", async (req, res) => {
  if(getLoadingFlag())
    res.json({ "status": "loading" });
  else
    res.json({ "tradingDay": getTradingDay() })
});

app.get("/s17", async (req, res) => {
  if(getLoadingFlag())
    res.json({ "status": "loading" });
  else
    res.json({ "s17" : getS17()});
});

app.get("/s33", async (req, res) => {
  if(getLoadingFlag())
    res.json({ "status": "loading" });
  else
    res.json({ "s33" : getS33()});
});

app.get("/stocks", async (req, res) => {
  if(getLoadingFlag())
    res.json({ "status": "loading" });
  else
    res.json({ "stocks" : getStocks()});
});

app.listen(PORT, _ => {
  console.log(`App listening at port ${ip.address()}:${PORT}`);
});