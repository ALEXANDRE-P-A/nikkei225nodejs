import "../css/header.css";
import { useEffect } from "react";

import { MdOutlineFormatAlignLeft } from "react-icons/md";

import { useSector } from "../context/SectorContext.js";
import { useAlertWin } from "../context/AlertWinContext.js";
import { useLoading } from "../context/LoadingContext.js";

import { useSelector, useDispatch } from "react-redux";
import { updateLastTradingDay, updateS17, updateS33, updateStocks } from "../store/modules/nikkei225.js";

const localFetchURI = "192.168.11.8:3000";

const Header = _ => {

  const [ sector, toggleSector ] = useSector();
  const [ ,toggleAlertWin ] = useAlertWin();
  const [ ,toggleLoading ] = useLoading();

  const lastTradingDay = useSelector(state => state.nikkei225.lastTradingDay);
  const dispatch = useDispatch();

  const fetchTradingDay = async _ => {
    fetch(`http://${localFetchURI}/lastTradingDay`)
    .then(response => response.json())
    .then(async json => {
      if(json && json.status === "loading"){
        console.log("loading");
        toggleLoading(true);
        setTimeout(async _ => { await fetchTradingDay(); }, 2500);
        return;
      } else
        toggleLoading(false);

      if(lastTradingDay === "" || lastTradingDay !== json.tradingDay){
        dispatch(updateLastTradingDay({ target: json.tradingDay }))
      } else {
        console.log("trading day is already the latest ...");
        await fetchS17();
        await fetchS33();
        await fetchStocks();
      }
    })
    .catch((error) => console.error("Error fetching data:", error));
  };

  const fetchS17 = async _ => {
    fetch(`http://${localFetchURI}/s17`)
    .then(res => res.json())
    .then(json => dispatch(updateS17({ target: json.s17 })))
  };

   const fetchS33 = async _ => {
    fetch(`http://${localFetchURI}/s33`)
    .then(res => res.json())
    .then(json => dispatch(updateS33({ target: json.s33 })))
  };

   const fetchStocks = async _ => {
    fetch(`http://${localFetchURI}/stocks`)
    .then(res => res.json())
    .then(json => dispatch(updateStocks({ target: json.stocks })))
  };

  useEffect(_ => {
    fetchTradingDay()
  }, []);

  const headerTradingDay = `${lastTradingDay.substring(0,4)}/${lastTradingDay.substring(5,6).padStart(2, "0")}/${lastTradingDay.substring(7,8).padStart(2, "0")}`;

  return (
    <div className="header">
        <div className="header-main">
          <span className="header-item">Nikkei 255 App for Swing Trade</span>
          <span className="header-item">Last Trading Day : { headerTradingDay } (JST)</span>
        </div>

        <div className="header-btn">
          <button 
            className={ sector ? "header-btn-inside toggled" : "header-btn-inside" } 
            onClick={ _ => {
              toggleAlertWin(true)
              toggleSector(true)
            }}
          >
            <MdOutlineFormatAlignLeft className="btn-icon" />
          </button>
        </div>
    </div>
  )
};

export { Header };