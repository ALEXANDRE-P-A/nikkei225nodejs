import axios from "axios";
import { config } from "dotenv";
import { findOne, find, updateOne, insertMany, resetCollection } from "../db/mongodb.mjs";
import { setTimeout } from 'timers/promises';

config();

const apiKey = process.env.J_QUANTS_API_KEY;
let loadingFlag = false;
let tradingDay = "";
let stocksArray = [];
let sectorsArray = [];

const client = axios.create({
  baseURL: "https://api.jquants.com",
  headers: { "x-api-key": apiKey },
});

const getLoadingFlag = _ => loadingFlag;

const getTradingDay = _ => tradingDay;

const getStocks = _ => stocksArray;

const getSectors = _ => sectorsArray;

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

const getLastTradingDayFromDB = async _ => {
  try {
    const traidingDayInDB = await findOne("nikkei225", "lastTradingDay", "last trading day");
    return traidingDayInDB.value;
  } catch(e) {
    console.log("ERROR when check last tranding day");
    console.log(e);
  };
};

const getSectorsFromDB = async _ => {
  try {
    const sectors = await findOne("nikkei225", "sectors", "sectors");
    return sectors.value;
  } catch(e) {
    console.log("ERROR when get sectors from DB");
    console.log(e);
  }
};

const getStocksFromDB = async _ => {
   try {
    const stocks = await find("nikkei225", "stocks");
    return stocks
  } catch(e) {
    console.log("ERROR when get stocks from DB");
    console.log(e);
  }
};

const switchLoadingFlag = async bool => {
  loadingFlag = bool;
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

const storeLastTradingDayToDB = async string => {
  try {
    const result = await updateOne("nikkei225", "lastTradingDay", "lastTradingDay", string);
    if(result.acknowledged)
      console.log("UPDATED SUCCESSFULLY the last trading day in DB");
    else 
      console.log("UPDATED FAILED the last trading day in DB");
  } catch(e) {
    console.log("ERROR when update last trading day to DB");
    console.log(e);
  };
};

const getTickersFromDB = async _ => {
  const tickers = await findOne("nikkei225", "tickers", "tickers");
  console.log("got tickers successfully");
  return tickers.tickers;
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
  const tickers = await getTickersFromDB();
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
      sector: masterInfo.S33Nm,
      open: lastDailyInfo[0].O,
      high: lastDailyInfo[0].H,
      low: lastDailyInfo[0].L,
      close: lastDailyInfo[0].C,
      volume: lastDailyInfo[0].Vo,
      value:  lastDailyInfo[0].Va,
      flag: calculatedMA
    }
    stocksArray.push(data);
    sectorsArray.push(masterInfo.S33Nm);
    console.log(`${i++} / ${tickers.length}  ${ticker} ${masterInfo.CoNameEn} ${calculatedMA}`);
    await setTimeout(3000);
  };
  try {
    const sectorsArrayDuplicationEliminated = [...new Set(sectorsArray)];
    sectorsArray = sectorsArrayDuplicationEliminated;
    const resetStocksResult = await resetCollection("nikkei225", "stocks");
    if(resetStocksResult.acknowledged){
      console.log("RESET SUCCESSFULLY collection 'stocks' in DB");
      const insertStocksResult = await insertMany("nikkei225", "stocks", stocksArray);
      const updateSectorsResult = await updateOne("nikkei225", "sectors", "sectors", sectorsArrayDuplicationEliminated);
      if(insertStocksResult.acknowledged)
        console.log(`UPDATE SUCCESSFULLY ${tickers.length} tickers in DB`);
      if(updateSectorsResult.acknowledged)
        console.log(`UPDATE SUCCESSFULLY ${sectorsArrayDuplicationEliminated.length} sectors in DB`);
    }
  } catch(e) {
    console.log("ERROR when update stock data to DB");
    console.log(e);
  };
};

const init = async _ => {
  if(tradingDay = "")
    tradingDay = await getLastTradingDayFromDB();
  if(stocksArray.length === 0)
    stocksArray = await getStocksFromDB();
  if(sectorsArray.length === 0)
    sectorsArray = await getSectorsFromDB();
};

const main = async _ => {
  await switchLoadingFlag(true);
  const lastTradingDayDB = await getLastTradingDayFromDB();
  // 1 : last dat, 2 : one day before
  const lastTradingDayJQuants = await getLastTradingDayFromJQuants(1);

  if(lastTradingDayDB === lastTradingDayJQuants)
    console.log("last trading day in DB is already the lastest");
  else {
    await storeLastTradingDayToDB(lastTradingDayJQuants);
    await updateProcess(lastTradingDayJQuants);
    tradingDay = lastTradingDayJQuants;
  }
  await switchLoadingFlag(false);
};

// init();

// main();

export { getLoadingFlag, getTradingDay, getSectors, getStocks }