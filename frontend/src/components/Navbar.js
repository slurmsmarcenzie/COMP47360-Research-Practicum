import React, { useState } from 'react';
import '../App.css';
import afterParty from '../images/after-party-logo-white.png';
import afterPartyHover from '../images/after-party-logo-violet.png';
import { Link, useMatch, useResolvedPath } from 'react-router-dom';

export default function Navbar() {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const logoImage = isHovered ? afterPartyHover : afterParty;

  return (
    <div className="navbar">
      <div className="navbar-links-wrapper">
        <Link to="/" className="site-title">
          <img
            src={logoImage}
            className={`navbar-logo ${isHovered ? 'hovered' : ''}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            alt="After Party Logo"
          />
        </Link>
      </div>
      <div className="navbar-links">
        <CustomLink to="/about">About Us</CustomLink>
      </div>
    </div>
  );
}

function CustomLink({ to, children, ...props }) {
  const resolvedPath = useResolvedPath(to);
  const isActive = useMatch({ path: resolvedPath.pathname, end: true });

  return (
    <li className={isActive ? 'active' : ''}>
      <Link to={to} {...props}>
        {children}
      </Link>
    </li>
  );
}
