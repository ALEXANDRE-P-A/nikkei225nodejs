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
  } catch (e) {
    console.error("error when get market time", e);
  }
};

export { marketTime };