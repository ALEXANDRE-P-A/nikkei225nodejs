import "../css/sectors.css";

import { GrRadialSelected } from "react-icons/gr";

import { useSector } from "../context/SectorContext.js";

import { Sector } from "./sector.js";

import { useSectorType } from "../context/SectorTypeContext.js";

import { s17NameArray } from "../static/s17name.js";
import { s33NameArray } from "../static/s33name.js";

const Sectors = _ => {

  const [ sector ] = useSector();
  const [ sectorType, switchSectorType ] = useSectorType();

  return (
    <div className={ sector ? "sectors toggled" : "sectors"}>
      <div className="sector-header">
        <div 
          className={ sectorType === "s17" ? "sector-type toggled" : "sector-type" }
          onClick={ _ => switchSectorType("s17") }
        >
          <span className="sector-type-item">{ sectorType === "s17" && <GrRadialSelected /> }</span>
          <span className="sector-type-item">S17</span>
          <span className="sector-type-item"></span>
        </div>
        <div 
          className={ sectorType === "s33" ? "sector-type toggled" : "sector-type" }
          onClick={ _ => switchSectorType("s33") }
        >
          <span className="sector-type-item">{ sectorType === "s33" && <GrRadialSelected /> }</span>
          <span className="sector-type-item">S33</span>
          <span className="sector-type-item"></span>
        </div>
      </div>
      <div className="sector-items">
        <Sector array={[ 0, "フラグがすべてTrueの銘柄", "All tickers flag is True"]} />
        {
          sectorType === "s17" && s17NameArray.map((item, index) => <Sector key={ index } array={ item } />)
        }
        {
          sectorType === "s33" && s33NameArray.map((item, index) => <Sector key={ index } array={ item } />)
        }
      </div>
    </div>
  )
};

export { Sectors };