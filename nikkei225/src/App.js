import "./css/common.css";

import { Header } from "./components/header.js";
import { Sectors } from "./components/sectors.js";
import { Stocks } from "./components/stocks.js";
import { AlertWindow } from "./components/alertWindow.js";

import { SectorProvider } from "./context/SectorContext.js";
import { AlertWinProvider } from "./context/AlertWinContext.js";

const App = _ => {

  return (
    <div className="app">

      <SectorProvider>
        <AlertWinProvider>
          <AlertWindow />
          <Header />
          <Sectors />
          <Stocks />
        </AlertWinProvider>
      </SectorProvider>
     
    </div>
  );
}

export default App;