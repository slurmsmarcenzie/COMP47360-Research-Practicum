import React from 'react';
import EventCard from './EventCard';
import "../App.css";

function FloatingInfoBox( {showingFloatingInfoBox, neighbourhoodEvents}) {

    console.log('neighbourhood events inside the navbox', neighbourhoodEvents)

    const eventCards = neighbourhoodEvents.map((item, i) =>{
        return (
            <EventCard 
            key = {i}
            item={item} />
        )
    }) 

    return showingFloatingInfoBox ? (
        <div className='floating-info-box'>
            {eventCards}
        </div>
    ) : null;
}

export default FloatingInfoBox