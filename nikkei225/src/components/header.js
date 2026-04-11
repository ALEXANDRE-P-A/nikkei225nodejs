import "../css/header.css";
import logo from "../images/logo.png";
import { useEffect } from "react";

import { MdOutlineFormatAlignLeft } from "react-icons/md";

import { useSector } from "../context/SectorContext.js";
import { useAlertWin } from "../context/AlertWinContext.js";
import { useLoading } from "../context/LoadingContext.js";

import { useSelector, useDispatch } from "react-redux";
import { updateLastTradingDay, updateS17, updateS33, updateStocks } from "../store/modules/nikkei225.js";

const FETCH_URL = window._env_?.FETCH_URL;

const Header = _ => {

  const [ sector, toggleSector ] = useSector();
  const [ ,toggleAlertWin ] = useAlertWin();
  const [ ,toggleLoading ] = useLoading();

  const lastTradingDay = useSelector(state => state.nikkei225.lastTradingDay);
  const dispatch = useDispatch();

  const fetchTradingDay = async _ => {
    fetch(`${FETCH_URL}/lastTradingDay`)
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
    fetch(`${FETCH_URL}/s17`)
    .then(res => res.json())
    .then(json => dispatch(updateS17({ target: json.s17 })))
  };

   const fetchS33 = async _ => {
    fetch(`${FETCH_URL}/s33`)
    .then(res => res.json())
    .then(json => dispatch(updateS33({ target: json.s33 })))
  };

   const fetchStocks = async _ => {
    fetch(`${FETCH_URL}/stocks`)
    .then(res => res.json())
    .then(json => dispatch(updateStocks({ target: json.stocks })))
  };

  useEffect(_ => {
    fetchTradingDay()
  }, []);

  const tYear = lastTradingDay.substring(0, 4);
  const tMonth = lastTradingDay.substring(4, 6);
  const tDay = lastTradingDay.substring(6, 8);

  const headerTradingDay = `${tYear}/${tMonth}/${tDay}`;

  return (
    <div className="header">
        <div className="header-main">
          <div>
             <img src={ logo } alt="Description" className="header-logo"/>
          </div>
          <div>
            <span className="header-item">Last Trading Day : { headerTradingDay } (JST)</span>
          </div>
        </div>

        <div className="header-btn">
          <button 
            className={ sector ? "header-btn-inside toggled" : "header-btn-inside" } 
            onClick={ _ => {
              toggleAlertWin(true)
              toggleSector(true)
            }}
          >
            <MdOutlineFormatAlignLeft style={{ width: "30px", height: "20px" }} />
          </button>
        </div>
    </div>
  )
};

export { Header };