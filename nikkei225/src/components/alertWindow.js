import "../css/alertWindow.css";
import loadingImg from "../images/loading.svg";

import { useSector } from "../context/SectorContext.js";
import { useAlertWin } from "../context/AlertWinContext.js";
import { useLoading } from "../context/LoadingContext.js";
import { useAboutThisApp } from "../context/AboutThisAppContext.js";

const AlertWindow = _ => {

  const [ ,toggleSector ] = useSector();
  const [ alertWin, toggleAlertWin ] = useAlertWin();
  const [ about, toggleAbout ] = useAboutThisApp();
  const [ loading ] = useLoading();

  return (
    <div 
      className={ alertWin || about || loading? "alertWindow" : "alertWindow hidden" }
      onClick={ _ => {
        toggleSector(false);
        toggleAbout(false);
        toggleAlertWin(false);
      }}
    >
      <div className={ loading ? "loading" : "not-loading" }>
        <div className="loading-icon">
          <img src={ loadingImg } className="loading-img" alt="logo" />
        </div>
        <div className="loading-msg">
          <span>Loading ...</span>
        </div>
      </div>
    </div>
  )
};

export { AlertWindow };