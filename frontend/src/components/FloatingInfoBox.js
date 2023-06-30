import React from 'react';
import EventCard from './EventCard';
import "../App.css";

function FloatingInfoBox( {showingFloatingInfoBox, showingNeighborHoodInfoBox, neighbourhoodEvents, simulateBusynessChange, zone}) {
    
    // const hasEvents = neighbourhoodEvents.length > 0;

    const eventCards = neighbourhoodEvents.map((item, i) =>{
        return (
            <EventCard 
            key = {i}
            item={item}
            simulateBusynessChange={simulateBusynessChange}
            />
        )
    }) 

    if (showingFloatingInfoBox) {
        return (
          <div className='floating-info-box'>
            <h1>{zone}</h1>
            {eventCards}
          </div>
        );
      }
    
      if (showingNeighborHoodInfoBox) {
        return (
          <div className='floating-info-box'>
            <h1>{zone}</h1>
            <p>There are no events in this zone.</p>
          </div>
        );
      }
    
      return null;
}

export default FloatingInfoBox