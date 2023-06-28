import React, {useState} from 'react';
import EventCard from './EventCard';
import "../App.css";

function FloatingInfoBox( {showingFloatingInfoBox, neighbourhoodEvents, simulateBusynessChange, hashMapOfDifference, showChartData, setShowChartData}) {
    
    const eventCards = neighbourhoodEvents.map((item, i) =>{
        return (
            <EventCard 
            key = {i}
            item={item}
            simulateBusynessChange={simulateBusynessChange}
            hashMap={hashMapOfDifference}
            showChartData={showChartData}
            setShowChartData={setShowChartData}
            />
        )
    }) 

    return showingFloatingInfoBox ? (
        <div className='floating-info-box'>
            {eventCards}
        </div>
    ) : null;
}

export default FloatingInfoBox