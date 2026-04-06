import axios from "axios";
import { config } from "dotenv";
import { findOneMongoDB, findManyMongoDB, updateOneMongoDB } from "../db/mongodb.mjs";
import { setTimeout } from 'timers/promises';

config();

const apiKey = process.env.J_QUANTS_API_KEY;
let loadingFlag = false;
let tradingDay = "";
let stocksArray = [];
let S17Array = [];
let S33Array = [];

const client = axios.create({
  baseURL: "https://api.jquants.com",
  headers: { "x-api-key": apiKey },
});

const getLoadingFlag = _ => loadingFlag;

const getTradingDay = _ => tradingDay;

const getS17 = _ => S17Array;

const getS33 = _ => S33Array;

const getStocks = _ => stocksArray;

const today = _ => {
  const d = new Date();
  const formatted = d.getFullYear() +
    ('0' + (d.getMonth() + 1)).slice(-2) +
    ('0' + d.getDate()).slice(-2);
  return formatted; // YYYYMMDD format
};

const dateBehind = day => {
  const d = new Date();
  d.setDate(d.getDate() - day);
  const formatted = d.getFullYear() +
    ('0' + (d.getMonth() + 1)).slice(-2) +
    ('0' + d.getDate()).slice(-2);
  return formatted;
};

const switchLoadingFlag = bool => {
  loadingFlag = bool;
  if(loadingFlag)
    console.log("loading");
  else
    console.log("loaded");
};

const getLastTradingDayFromJQuants = async num => {
  try {
    const tradingCalendar = await client.get("/v2/markets/calendar", {
      params: {
        from: dateBehind(15),
        to: today(),
      },
    });
    const tradingCalendarFiltered = tradingCalendar.data.data.filter(day => day.HolDiv == 1);
    const lastTradingDay = tradingCalendarFiltered[tradingCalendarFiltered.length - num].Date;
    const splittedLastTradingDay = lastTradingDay.split("-");
    const concattedSplittedLastTradingDay = splittedLastTradingDay.join("");
    return concattedSplittedLastTradingDay;
  } catch(e) {
    console.log("ERROR when get last tranding day from J-quants");
    console.log(e);
  };
};

const getMasterInfo = async (ticker, day) => {
  try {
    const result = await client.get('/v2/equities/master', {
      params: {
        code: ticker,
        date: day,
      },
    });
    return result.data.data[0];
  } catch(e) {
    console.log(`ERROR when get ${ticker} master info`);
    console.error(e);
  }
};

const getLastDailyInfo = async (ticker, day) => {
  try {
    const result = await client.get('/v2/equities/bars/daily', {
      params: {
        code: ticker,
        date: day,
      },
    });
    return result.data.data;
  } catch(e) {
    console.log(`ERROR when get ${ticker} today data`);
    console.error(e);
  }
};

const getHistoricalDailyInfo = async (ticker, toDay) => {
  try {
    const array = await client.get('/v2/equities/bars/daily', {
      params: {
        code: ticker,
        from: dateBehind(60),
        to: toDay,
      },
    });
    return array.data.data;
  } catch(e) {
    console.log(`ERROR when get ${ticker} daily info`);
    console.error(e);
  }
};

const calculateMA = async (ticker, toDay) => {

  let lastDayFlag = false;
  let oneDayBeforeFlag = false;

  const historicalDataArray = await getHistoricalDailyInfo(ticker, toDay);

  const lastCloseVal = historicalDataArray[historicalDataArray.length - 1].C;
  const last5data = historicalDataArray.slice(-5);
  const MA5 = last5data.reduce((accumulator, currentValue) => accumulator + currentValue.C, 0) / 5;
  const last25data = historicalDataArray.slice(-25);
  const MA25 = last25data.reduce((accumulator, currentValue) => accumulator + currentValue.C, 0) / 25;
  if(MA5 > MA25 && lastCloseVal >= MA5) // エントリー条件１：５日線が２５日線よりも上（２５日線を含まない) // エントリー条件２：株価の終値が５日線以上（５日線を含む）
    lastDayFlag = true;

  historicalDataArray.pop();
  const oneDayBeforeCloseVal = historicalDataArray[historicalDataArray.length - 1].C;
  const oneDayBefore5data = historicalDataArray.slice(-5);
  const oneDayBeforeMA5 =  oneDayBefore5data.reduce((accumulator, currentValue) => accumulator + currentValue.C, 0) / 5;
  const oneDayBefore25data = historicalDataArray.slice(-25);
  const oneDayBeforeMA25 =  oneDayBefore25data.reduce((accumulator, currentValue) => accumulator + currentValue.C, 0) /25;
  if(oneDayBeforeMA5 > oneDayBeforeMA25 && oneDayBeforeCloseVal >= oneDayBeforeMA5) // エントリー条件１：５日線が２５日線よりも上（２５日線を含まない) // エントリー条件２：株価の終値が５日線以上（５日線を含む）
    oneDayBeforeFlag = true;

  return !oneDayBeforeFlag && lastDayFlag;
  // return lastDayFlag;
};

const updateProcess = async lastTradingDay => {
  let i = 1;
  console.log(`${lastTradingDay} update start`);
  const tickers = await findOneMongoDB("nikkei225", "tickers", "tickers");
  for(const ticker of tickers){
    const masterInfo = await getMasterInfo(ticker, lastTradingDay);
    const lastDailyInfo = await getLastDailyInfo(ticker, lastTradingDay);
     if(masterInfo === undefined || lastDailyInfo === undefined){
      console.log(ticker, " unavailable");
      continue;
    }
    const calculatedMA = await calculateMA(ticker, lastTradingDay);
   
    const data = {
      code: ticker,
      nameJp: masterInfo.CoName,
      nameEn: masterInfo.CoNameEn,
      s17: Number(masterInfo.S17),
      s33: Number(masterInfo.S33),
      open: lastDailyInfo[0].O,
      high: lastDailyInfo[0].H,
      low: lastDailyInfo[0].L,
      close: lastDailyInfo[0].C,
      volume: lastDailyInfo[0].Vo,
      value:  lastDailyInfo[0].Va,
      flag: calculatedMA
    }
    stocksArray.push(data);
    S17Array.push(masterInfo.S17);
    S33Array.push(masterInfo.S33);
    console.log(`${i++} / ${tickers.length}  ${ticker} ${masterInfo.CoNameEn} ${masterInfo.S17} ${masterInfo.S33} ${calculatedMA}`);
    await setTimeout(3000);
  };
  // sectors deduplication
  const deduplicationS17 = [ ...new Set(S17Array) ];
  const deduplicationS33 = [ ...new Set(S33Array) ];
  // update sectors variable
  S17Array = deduplicationS17;
  S33Array = deduplicationS33
  // update sectors to DB
  await updateOneMongoDB("nikkei225", "sectors", "S17", deduplicationS17);
  await updateOneMongoDB("nikkei225", "sectors", "S33", deduplicationS33);
  // update stocks to DB
  await updateOneMongoDB("nikkei225", "stocks", "nikkei225", stocksArray);
};

const init = async _ => {
  switchLoadingFlag(true);

  if(tradingDay === "")
    tradingDay = await findOneMongoDB("nikkei225", "lastTradingDay", "lastTradingDay");

  if(S17Array.length === 0)
    S17Array = await findOneMongoDB("nikkei225", "sectors", "S17");

  if(S33Array.length === 0)
    S33Array = await findOneMongoDB("nikkei225", "sectors", "S33");

  if(stocksArray.length === 0)
    stocksArray = await findOneMongoDB("nikkei225", "stocks", "nikkei225");

  switchLoadingFlag(false);
  console.log("INITIALIZED");
};

const main = async _ => {
  switchLoadingFlag(true);
  const lastTradingDayDB = await findOneMongoDB("nikkei225", "lastTradingDay", "lastTradingDay");
  // 1 : last dat, 2 : one day before
  const lastTradingDayJQuants = await getLastTradingDayFromJQuants(1);

  if(lastTradingDayDB === lastTradingDayJQuants){
    console.log("last trading day in DB is already the lastest");
    await init()
  } else {
    updateOneMongoDB("nikkei225", "lastTradingDay", "lastTradingDay", lastTradingDayJQuants);
    await updateProcess(lastTradingDayJQuants);
    tradingDay = lastTradingDayJQuants;
  }
  switchLoadingFlag(false);
};

// main();
init();

export { main, getLoadingFlag, getTradingDay, getS17, getS33, getStocks }