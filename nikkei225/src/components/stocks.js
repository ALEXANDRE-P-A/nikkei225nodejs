import "../css/stocks.css";

import { MdFilterAlt } from "react-icons/md";

import { Ticker } from "./ticker";

import { useSectorNo } from "../context/SectorNoContext";
import { s17NameArray } from "../static/s17name.js";
import { s33NameArray } from "../static/s33name.js";
import { useFilterSp } from "../context/FilterSpContext.js";

import { useSelector } from "react-redux";

const Stocks = _ => {

  const [ sectorNo ] = useSectorNo();
  const [ filterSp, toggleFilterSp ] = useFilterSp();

  const stocks = useSelector(state => state.nikkei225.stocks);

  let selectedSector;

  if(sectorNo === 0)
    selectedSector = [[ 0, "True Tickers", "True Tickers" ]];
  else
    selectedSector = s17NameArray.concat(s33NameArray).filter(item => item[0] === sectorNo);

  return (
    <div className="stocks">

      <div className="stocks-info-sp">
        <div className="sector-selected">
          { selectedSector[0][2] }
        </div>
        <button 
          className={ filterSp ? "ticker-filter-btn toggled" : "ticker-filter-btn" }
          onClick={ _ => toggleFilterSp(true) }
          style={{ display: "none" }}
        >
          <MdFilterAlt style={{ width: "75%", height: "75%" }} />
        </button>
      </div>

      {
        stocks
          .filter(item => {
            if(sectorNo === 0)
              return item.flag === true;
            else
              return item.s17 === sectorNo || item.s33 === sectorNo
          })
          .map((item, index) => <Ticker key={ index } obj={ item } />)
      }
    </div>
  )
};

export { Stocks };