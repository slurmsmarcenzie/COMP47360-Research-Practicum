import React, {useState, useEffect} from 'react';
import EventCard from './EventCard';
import NeighbourhoodChartData from './NeighbourhoodChartData';
import "../App.css";

function FloatingInfoBox( {showingFloatingInfoBox, neighbourhoodEvents, calculateEventImpact, hashMapOfDifference, showChartData, setShowChartData, colours, highlightEventImpact, showingNeighborHoodInfoBox, zone, updateLayerColours, resetColours, isSplitView, setSplitView}) {
  
  const [zoneID, setZoneID] = useState(null);
  const [eventName, setEventName] = useState(null);

  // when the neighbourhood events changes/if they change/ then set the zone id to the zone id value of the first item in the events list, as they will all have the same value

  useEffect(() => {
    if(neighbourhoodEvents && neighbourhoodEvents.length > 0) {
      setZoneID(neighbourhoodEvents[0].Zone_ID);
      setEventName(neighbourhoodEvents[0].Event_Name);
    }
  }, [neighbourhoodEvents]);

  const eventCards = neighbourhoodEvents ? neighbourhoodEvents.map((item, i) =>{
    return (
      <EventCard 
        key = {i}
        item={item}
        calculateEventImpact={calculateEventImpact}
        setShowChartData={setShowChartData}
      />
      )
  }) : null;
    
  return (
    (showingFloatingInfoBox || showingNeighborHoodInfoBox) && (
      <div className='floating-info-box'>
        <h1 className='floating-info-box-zone-header'>
          {showChartData ? eventName : zone}
        </h1>
        {showingFloatingInfoBox
          ? showChartData
            ? (
              <NeighbourhoodChartData 
                hashMap={hashMapOfDifference}
                colours={colours}
                highlightEventImpact={highlightEventImpact}
                zoneID={zoneID}
                updateLayerColours={updateLayerColours}
                resetColours={resetColours}
                isSplitView={isSplitView}
                setSplitView={setSplitView}
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