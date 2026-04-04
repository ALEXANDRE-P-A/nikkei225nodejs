import { createContext, useContext, useState } from "react";

const AlertWindowContext = createContext();

export const AlertWinProvider = ({ children }) => {

  const [ alertWin, toggleAlertWin ] = useState(false);

  return (
    <AlertWindowContext.Provider value={[ alertWin, toggleAlertWin ]}>
      { children }
    </AlertWindowContext.Provider>
  )
};

export const useAlertWin = _ => useContext(AlertWindowContext);
