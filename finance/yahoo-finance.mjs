import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey', 'ripHistorical'] });

const marketTime = async _ => {
  try {
    const query = "^N225";
    const result = await yahooFinance.quote(query);
    if(result && result.regularMarketTime){
      console.log("crue: ", result.regularMarketTime);
      const date = new Date(result.regularMarketTime);
      console.log("date: ", date);
      const unixTimeStamp = Math.floor(date.getTime() / 1000);
      console.log("unix: ", unixTimeStamp);
    }
  } catch (e) {
    console.error("error when get market time", e);
  }
};

export { marketTime };