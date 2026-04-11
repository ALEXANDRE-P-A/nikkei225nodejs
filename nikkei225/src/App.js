import "./css/common.css";

import { Provider } from 'react-redux';
import { store, persistor } from "./store";
import { PersistGate } from "redux-persist/integration/react";

import { Header } from "./components/header.js";
import { Sectors } from "./components/sectors.js";
import { Stocks } from "./components/stocks.js";
import { AlertWindow } from "./components/alertWindow.js";
import { AboutThisApp } from "./components/aboutThisApp.js";

import { SectorProvider } from "./context/SectorContext.js";
import { SectorTypeProvider } from "./context/SectorTypeContext.js";
import { AlertWinProvider } from "./context/AlertWinContext.js";
import { SectorNoProvider } from "./context/SectorNoContext.js";
import { LoadingProvider } from "./context/LoadingContext.js";
import { AboutThisAppProvider } from "./context/AboutThisAppContext.js";

const App = _ => {

  return (
    <div className="app">
      <Provider store={ store }>
        <PersistGate loading={ null } persistor={ persistor }>
          <SectorProvider>
            <SectorTypeProvider>
              <AlertWinProvider>
                <SectorNoProvider>
                  <AboutThisAppProvider>
                    <LoadingProvider>
                      <AlertWindow />
                      <Header />
                      <Sectors />
                      <Stocks />
                      <AboutThisApp />
                    </LoadingProvider>
                  </AboutThisAppProvider>
                </SectorNoProvider>
              </AlertWinProvider>
            </SectorTypeProvider>
          </SectorProvider>
        </PersistGate>
      </Provider>
    </div>
  );
}

export default App;