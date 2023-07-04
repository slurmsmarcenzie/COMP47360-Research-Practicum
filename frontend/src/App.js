import React from 'react';
import Map from './components/Map';
import MobileMap from './components/MobileMap';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import About from './pages/About';
import Navbar from './components/Navbar';

function App() {
  const isMobileDevice = () => {
    return (
      typeof window.orientation !== 'undefined' ||
      navigator.userAgent.indexOf('IEMobile') !== -1
    );
  };

  const location = useLocation();
  const isAboutPage = location.pathname === '/about';

  return (
    <>
    <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={isAboutPage ? <About /> : <Map />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
      {!isAboutPage && (isMobileDevice() ? <MobileMap /> : null)}
    </>
  );
  
}

export default App;
