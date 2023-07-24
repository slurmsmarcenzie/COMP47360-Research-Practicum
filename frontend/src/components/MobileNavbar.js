import React, { useState } from 'react';
import '../App.css';
import afterParty from '../images/after-party-logo-white.png';
import afterPartyHover from '../images/after-party-logo-violet.png';
import Modal from './Modal';
import { useMapContext } from './MapContext';

export default function MobileNavbar() {

  const {mapStyle, setMapStyle} = useMapContext();

  const [isHovered, setIsHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };
  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const logoImage = isHovered ? afterPartyHover : afterParty;

  return (
    <div className="navbar">
      <div className="navbar-links-wrapper">
        <button className="transparent-button" onClick={openModal}>
          <img
            src={logoImage}
            className={`navbar-logo ${isHovered ? 'hovered' : ''}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            alt="After Party Logo"
          />
        </button>
      </div>
      <div className="navbar-links">
        <div className="button-group">
          <button 
          className='navbar-toggle-dark-mode-button'
          onClick={() => {
            setMapStyle(mapStyle => mapStyle === 'mapbox://styles/mapbox/dark-v11' 
              ? 'mapbox://styles/mapbox/light-v11' 
              : 'mapbox://styles/mapbox/dark-v11');
          }}>
          {mapStyle === 'mapbox://styles/mapbox/dark-v11' ? '🌞' : '🌙'}
        </button>
        </div>
      </div>
      {showModal && (
        <Modal onClose={closeModal} />
      )}
    </div>
  );
}