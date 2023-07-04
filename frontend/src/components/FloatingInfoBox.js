import React, {useState} from 'react';
import EventCard from './EventCard';
import NeighbourhoodChartData from './NeighbourhoodChartData';
import "../App.css";

function FloatingInfoBox( {showingFloatingInfoBox, neighbourhoodEvents, calculateEventImpact, hashMapOfDifference, showChartData, setShowChartData, colours, highlightEventImpact, showingNeighborHoodInfoBox, zone, updateLayerColours}) {
    

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
    (showingFloatingInfoBox || showingNeighborHoodInfoBox) && (
      <div className='floating-info-box'>
        <h1>{zone}</h1>
        {showingFloatingInfoBox
          ? showChartData
            ? (
              <NeighbourhoodChartData 
                hashMap={hashMapOfDifference}
                colours={colours}
                highlightEventImpact={highlightEventImpact}
                updateLayerColours={updateLayerColours}
              />
            )
            : eventCards
          : <p>There are no events in this zone.</p>
        }
      </div>
    )
  );
}

export default FloatingInfoBox