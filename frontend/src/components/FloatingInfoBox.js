import React, {useState, useEffect} from 'react';
import EventCard from './EventCard';
import NeighbourhoodChartData from './NeighbourhoodChartData';
import "../App.css";

function FloatingInfoBox( {showingFloatingInfoBox, neighbourhoodEvents, calculateEventImpact, hashMapOfDifference, showChartData, setShowChartData, colours, highlightEventImpact, showingNeighborHoodInfoBox, zone, updateLayerColours, resetColours}) {
  
  const [Zone_ID, setZone_ID] = useState(null);

  useEffect(() => {
    if(neighbourhoodEvents && neighbourhoodEvents.length > 0) {
      setZone_ID(neighbourhoodEvents[0].Zone_ID);
    }
  }, [neighbourhoodEvents]);

  const eventCards = neighbourhoodEvents.map((item, i) =>{
    return (
      <EventCard 
        key = {i}
        item={item}
        calculateEventImpact={calculateEventImpact}
        setShowChartData={setShowChartData}
      />
      )
  });
    
  return (
    (showingFloatingInfoBox || showingNeighborHoodInfoBox) && (
      <div className='floating-info-box'>
        <h1 className='floating-info-box-zone-header'>{zone}</h1>
        {showingFloatingInfoBox
          ? showChartData
            ? (
              <NeighbourhoodChartData 
                hashMap={hashMapOfDifference}
                colours={colours}
                highlightEventImpact={highlightEventImpact}
                Zone_ID={Zone_ID}
                updateLayerColours={updateLayerColours}
                resetColours={resetColours}
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