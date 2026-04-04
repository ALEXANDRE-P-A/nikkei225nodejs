import { createContext, useContext, useState } from "react";

const SectorContext = createContext();

export const SectorProvider = ({ children }) => {

  const [ sector, toggleSector ] = useState(false);

  return (
    <SectorContext.Provider value={[ sector, toggleSector ]}>
      { children }
    </SectorContext.Provider>
  )
};

export const useSector = _ => useContext(SectorContext);
