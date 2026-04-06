import "../css/sector.css";

import { GrRadialSelected } from "react-icons/gr";

import { useSectorNo } from "../context/SectorNoContext";
import { useSector } from "../context/SectorContext";
import { useAlertWin } from "../context/AlertWinContext";

const Sector = ({ array }) => {

  const [ sectorNo, setSectorNo ] = useSectorNo();
  const [ ,toggleSector ] = useSector();
  const [ ,toggleAlertWin ] = useAlertWin();

  return (
    <div 
      className={ sectorNo === array[0] ? "sector toggled" : "sector" }
      onClick={ _ => {
        setSectorNo(array[0]);
        toggleSector(false);
        toggleAlertWin(false);
      }}
    >
      <div className="selected-flag">
        <div className={ sectorNo === array[0] ? "selector-flag-icon toggled" : "selector-flag-icon" }>
          <GrRadialSelected style={{ width: "30%", height: "30%", aspectRatio: 1 }} />
        </div>
      </div>
      <div className="sector-name">{ array[2] }</div>
      <div className="sector-number">{ array[0] }</div>
    </div>
  )
};

export { Sector };