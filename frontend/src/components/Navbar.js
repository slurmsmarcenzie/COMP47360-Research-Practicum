import React from 'react';
import "../App.css";
import afterParty from '../images/after-party-logo-white.png';
import { Link } from 'react-router-dom';


function Navbar() {
  return (
      <div className='navbar'>
        <img src={afterParty} className='navbar-logo'/>
        <div className="navbar-links">
          <div className='navbar-links-wrapper'>
            <a href="/contact-us">Contact Us</a>
          </div>
          <div className='navbar-links-wrapper'>
            <a href="/about-us">About Us</a>
          </div>
        </div>
      </div>
    )
}

export default Navbar