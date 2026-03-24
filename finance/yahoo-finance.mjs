import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey', 'ripHistorical'] });

const marketTime = async _ => {
  try {
    const query = "^N225";
    const result = await yahooFinance.quote(query);
    if(result && result.regularMarketTime){
      const date = new Date(result.regularMarketTime);
      const unixTimeStamp = Math.floor(date.getTime() / 1000);
      return unixTimeStamp;
    }
  } catch(e) {
    console.error("error when get market time", e);
  }
};

const tickerSector = async ticker => {
   try {
    const queryOptions = { modules: ["summaryProfile"] };
    const result = await yahooFinance.quoteSummary(ticker, queryOptions);
    const sector = result.summaryProfile.sector;
    return sector;
  } catch(e) {
    console.error(`error when get ${ticker} sector`, e);
  }
};

const allSectors = async tickers => {
  let sectorsArray = [];

  try {
    for(const ticker of tickers){
      const sector = await tickerSector(`${ticker}.T`);
      sectorsArray.push(sector);
    }
  } catch(e) {
    console.log("error when get all sectors", e);
  };

  const uniqueSectorsArray = [ ...new Set(sectorsArray) ];
  return uniqueSectorsArray;
};

const stockData = async ticker => {
  try {
    const queryOptions = { modules: [ "price" ] };
    const result = await yahooFinance.quoteSummary(ticker, queryOptions);
    return result.price;
  } catch(e) {
    console.log(`error when get ${ticker} stock data`, e);
  }
};

const getPeriodDate = daysBehind => {
  const date = new Date();

  date.setDate(date.getDate() - daysBehind);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2,'0'); // 月は0-11
  const day = String(date.getDate()).padStart(2,'0');

  const formattedDate = `${year}-${month}-${day}`;

  return formattedDate;
};

const calculateEntryCode = async ticker => {
  let entryCode = 0;
  /* 
    パターン１：５日線が２０日線よりも上（２０日線を含まない)で株価の終値が５日線以上（５日線を含む）であれば entryCode + 10
    パターン２：５日線が２５日線よりも上（２５日線を含まない)で株価の終値が５日線以上（５日線を含む）であれば entryCode + 01
    ※ entryCode の取りうる値は、0, 1, 10, 11 の４つ
  */ 

  const queryOptions = {
    period1: getPeriodDate(60), // 開始日 (YYYY-MM-DD または UNIX時間)
    period2: getPeriodDate(0), // 終了日 (必須)
    interval: '1d'// データ間隔 ('1d' = 日次'1wk' = 週次'1mo' = 月次)
  };

  try {
    const results = await yahooFinance.historical(ticker, queryOptions);

    const lastCloseValue = results[results.length-1].close;

    const total5daysbehindCloseVal = results.slice(-5).reduce((accumulator, currentValue) => accumulator + currentValue.close, 0);
    const total20daysbehindCloseVal = results.slice(-20).reduce((accumulator, currentValue) => accumulator + currentValue.close, 0);
    const total25daysbehindCloseVal = results.slice(-25).reduce((accumulator, currentValue) => accumulator + currentValue.close, 0);

    const MA5 = total5daysbehindCloseVal / 5;
    const MA20 = total20daysbehindCloseVal / 20;
    const MA25 = total25daysbehindCloseVal / 25;

    // パターン１の計算
    if((MA5 > MA20) && (lastCloseValue >= MA5))
      entryCode += 10;

    // パターン２の計算
    if((MA5 > MA25) && (lastCloseValue >= MA5))
      entryCode += 1;

  } catch (e) {
    console.error("error in calcuting entry condition: ". e);
  }

  return entryCode;
}

const allStocksData = async tickers => {
  let allStocksArray = [];
  try {
    for(const ticker of tickers){
      const data = await stockData(`${ticker}.T`);
      const name = data.longName || data.shortName; 
      const open = data.regularMarketOpen;
      const high = data.regularMarketDayHigh;
      const low = data.regularMarketDayLow;
      const price = data.regularMarketPrice;
      const volume = data.regularMarketVolume;
      const cap = data.marketCap;
      const entry = await calculateEntryCode(`${ticker}.T`);

      const dataObj = { ticker, name, open, high, low, price, volume, cap, entry};
      allStocksArray.push(dataObj);
    }
  } catch(e) {
    console.log("error when get all stocks data", e);
  }
  return allStocksArray;
};

export { marketTime, allSectors, allStocksData };