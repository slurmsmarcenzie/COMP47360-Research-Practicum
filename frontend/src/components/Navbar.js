  import React from 'react';
import "../App.css";
import afterParty from '../images/afterparty.JPG';
import { Link } from 'react-router-dom';


function Navbar() {
    return(
        <div className='navbar'>
          <img src={afterParty}/>

          <div className="navbar-links">
        <a href="/contact-us">Contact Us</a>
        <a href="/about-us">About Us</a>
      
      </div>
        </div>
    )
}

export default Navbar