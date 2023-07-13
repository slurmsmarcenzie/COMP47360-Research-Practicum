import React from 'react';
import Map from './components/Map';
import MobileMap from './components/MobileMap';
import { MapProvider } from './components/MapContext';

function App() {

  const isMobileDevice = () => {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
};

  return (
    <MapProvider>
      <div className="App">
        {isMobileDevice() ? <MobileMap /> : <Map />}
      </div>
    </MapProvider>
  );
}

export default App