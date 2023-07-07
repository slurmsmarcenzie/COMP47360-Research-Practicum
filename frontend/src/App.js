import React from 'react';
import Map from './components/Map';
import MobileMap from './components/MobileMap';

function App() {

  const isMobileDevice = () => {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
};

return (
  <div className="App">
    {isMobileDevice() ? <MobileMap /> : <Map />}
  </div> ); }

export default App;
