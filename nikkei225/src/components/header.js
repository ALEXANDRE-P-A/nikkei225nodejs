import "../css/header.css";

import { MdOutlineFormatAlignLeft } from "react-icons/md";

import { useSector } from "../context/SectorContext.js";
import { useAlertWin } from "../context/AlertWinContext.js";

const Header = _ => {

  const [ sector, toggleSector ] = useSector();
  const [ ,toggleAlertWin ] = useAlertWin();

  return (
    <div className="header">
      
      <div className="header-main">
        Nikkei 255 App for Swing Trade
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