import React, {useState} from 'react';
import EventCard from './EventCard';
import NeighbourhoodChartData from './NeighbourhoodChartData';
import "../App.css";

function FloatingInfoBox( {showingFloatingInfoBox, neighbourhoodEvents, calculateEventImpact, hashMapOfDifference, showChartData, setShowChartData, colours}) {
    
    const eventCards = neighbourhoodEvents.map((item, i) =>{
        
    return (
            <EventCard 
            key = {i}
            item={item}
            calculateEventImpact={calculateEventImpact}
            setShowChartData={setShowChartData}
            />
        )
    }) 

    return (
        showingFloatingInfoBox && (
            <div className='floating-info-box'>
                {showChartData ? 
                <NeighbourhoodChartData 
                hashMap={hashMapOfDifference}
                colours={colours}
                /> 
                : eventCards}
            </div>
        )
    );
}

export default FloatingInfoBox