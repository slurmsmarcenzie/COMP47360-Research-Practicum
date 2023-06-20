import React from 'react';
import "../App.css";

function FloatingNav({ changeColourScheme, enableColours }) {
    return(
        <div className='floating-nav'>
          <form className='floating-nav-form'>
            <select className='floating-nav-dropdown'>
              <option>
                Test Event 1
              </option>
              <option>
                Test Event 2
              </option>
            </select>
          </form>
          <button className="floating-nav-cta-button" onClick={changeColourScheme}>Change Colour Set</button>
          <button className="floating-nav-outline-button" onClick={enableColours}>Reset</button>
        </div>
    )
}

export default FloatingNav