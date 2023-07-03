import React from 'react';
import Map from './components/Map';
import MobileMap from './components/MobileMap'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import About from './components/About'


function App() {
  
  const isMobileDevice = () => {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
};

  return (
    <div className="App">
      {isMobileDevice() ? <MobileMap /> : <Map />}
    </div>
  );
}

export default App;