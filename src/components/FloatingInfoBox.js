import React from 'react';
import "../App.css";

function FloatingInfoBox( {showingFloatingInfoBox}) {
    return showingFloatingInfoBox ? (
        <div className='floating-info-box'>
            <p>This is the floating infobox</p>
        </div>
    ) : null;
}

export default FloatingInfoBox