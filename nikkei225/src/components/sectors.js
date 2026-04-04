import "../css/sectors.css";

import { useSector } from "../context/SectorContext.js";

import { Sector } from "./sector.js";

const Sectors = _ => {

  const [ sector ] = useSector();

  return (
    <div className={ sector ? "sectors toggled" : "sectors"}>
      <Sector />
      <Sector />
      <Sector />
      <Sector />
      <Sector />
      <Sector />
      <Sector />
      <Sector />
      <Sector />
      <Sector />
      <Sector />
      <Sector />
      <Sector />
      <Sector />
      <Sector />
      <Sector />
      <Sector />
      <Sector />
      <Sector />
      <Sector />
      <Sector />
      <Sector />
      <Sector />
      <Sector />
      <Sector />
      <Sector />
    </div>
  )
};

export { Sectors };