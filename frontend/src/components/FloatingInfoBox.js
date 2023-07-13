import React, {useState, useEffect} from 'react';
import EventCard from './EventCard';
import NeighbourhoodChartData from './NeighbourhoodChartData';
import "../App.css";
import { useMapContext } from './MapContext';

function FloatingInfoBox( {map, visualiseEventImpact, highlightEventImpact, originalBusynessHashMap, busynessHashMap, hashMapOfDifference, colours, resetColours }) {
  
  const {showInfoBox, showChartData, showNeighborhoodInfoBox, neighbourhoodEvents} = useMapContext();

  const {zoneID, setZoneID, eventName, setEventName, zone, setZone} = useMapContext();

  // when the neighbourhood events changes/if they change/ then set the zone id to the zone id value of the first item in the events list, as they will all have the same value

  useEffect(() => {
    if(neighbourhoodEvents && neighbourhoodEvents.length > 0) {
      setZoneID(neighbourhoodEvents[0].Zone_ID);
      setEventName(neighbourhoodEvents[0].Event_Name);
      setZone(neighbourhoodEvents[0].Zone_Name)
    }
  }, [neighbourhoodEvents]);

  const eventCards = neighbourhoodEvents ? neighbourhoodEvents.map((item, i) =>{
    return (
      <EventCard 
        key = {i}
        item={item}
        visualiseEventImpact={visualiseEventImpact}
      />
      )
  }) : null;
    

  console.log('showInfoBox', showInfoBox)
  console.log('showNeighborhoodInfoBox', showNeighborhoodInfoBox)

  return (
    (showInfoBox || showNeighborhoodInfoBox) && (
      <div className='floating-info-box'>
        <h1 className='floating-info-box-zone-header'>
          {showChartData ? eventName : zone}
        </h1>
        {showInfoBox
          ? showChartData
            ? (
              <NeighbourhoodChartData 
                map={map}
                hashMap={hashMapOfDifference}
                busynessHashMap={busynessHashMap}
                originalBusynessHashMap={originalBusynessHashMap}
                colours={colours}
                highlightEventImpact={highlightEventImpact}
                zoneID={zoneID}
                resetColours={resetColours}
              />
              )
            : eventCards
          : null
        }
        {showNeighborhoodInfoBox && <p>There are no events in this zone.</p>}
      </div>
    )
  );  
}

export default FloatingInfoBox