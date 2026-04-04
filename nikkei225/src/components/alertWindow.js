import "../css/alertWindow.css";

import { useSector } from "../context/SectorContext.js";
import { useAlertWin } from "../context/AlertWinContext.js";

const AlertWindow = _ => {

  const [ ,toggleSector ] = useSector();
  const [ alertWin, toggleAlertWin ] = useAlertWin();

  return (
    <div 
      className={ alertWin ? "alertWindow" : "alertWindow hidden" }
      onClick={ _ => {
        toggleSector(false);
        toggleAlertWin(false);
      }}
    >
    </div>
  )
};

export { AlertWindow };