import React from 'react';
import "../App.css";

function FloatingNav({ changeColourScheme }) {
    return(
        <div className='floating-nav'>
          <button className="floating-nav-cta-button" onClick={changeColourScheme}>Change Colour Set</button>
        </div>
    )
}

export default FloatingNav