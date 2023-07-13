import React, {useState, useEffect} from 'react';
import EventCard from './EventCard';
import NeighbourhoodChartData from './NeighbourhoodChartData';
import "../App.css";
import { useMapContext } from './MapContext';
import { scaleLinear } from 'd3-scale';

function FloatingInfoBox( {map, visualiseEventImpact, highlightEventImpact, originalBusynessHashMap, busynessHashMap, hashMapOfDifference, colours, resetColours }) {
  
  const {showInfoBox, showChartData, showNeighborhoodInfoBox, neighbourhoodEvents, colourPairs, colourPairIndex} = useMapContext();

  const {zoneID, setZoneID, eventName, setEventName, zone, setZone, useOriginal, setUseOriginal} = useMapContext();

  const [richText, setRichText] = useState(null);
  const [textColour, setTextColour] = useState(null);

  // when the neighbourhood events changes/if they change/ then set the zone id to the zone id value of the first item in the events list, as they will all have the same value

  useEffect(() => {
    if(neighbourhoodEvents && neighbourhoodEvents.length > 0) {
      setZoneID(neighbourhoodEvents[0].Zone_ID);
      setEventName(neighbourhoodEvents[0].Event_Name);
      setZone(neighbourhoodEvents[0].Zone_Name)
    }
    
  }, [neighbourhoodEvents]);

  useEffect(() => {
    const colourScale = scaleLinear().domain([0, 0.4, 0.8]).range(colourPairs[colourPairIndex]);
    const neighbourhoodBusyness = useOriginal ? originalBusynessHashMap[zoneID] : busynessHashMap[zoneID]
    const colour = colourScale(neighbourhoodBusyness);
    setTextColour(colour);
    let text;
    if (neighbourhoodBusyness < 0.29) {
        text = 'Not Very Busy';
    } else if (neighbourhoodBusyness >= 0.29 && neighbourhoodBusyness < 0.4) {
        text = 'Relatively Busy';
    } else if (neighbourhoodBusyness >= 0.4 && neighbourhoodBusyness < 0.7) {
        text = 'Busy';
    } else {
        text = 'Extremely Busy';
    }
    setRichText(text);
  }, [colourPairs, colourPairIndex, busynessHashMap, originalBusynessHashMap, zoneID]);
  
  const eventCards = neighbourhoodEvents ? neighbourhoodEvents.map((item, i) =>{
    return (
      <EventCard 
        key = {i}
        item={item}
        visualiseEventImpact={visualiseEventImpact}
      />
      )
  }) : null;

  return (
    (showInfoBox || showNeighborhoodInfoBox) && (
      <div className='floating-info-box'>
        <h1 className='floating-info-box-zone-header'>
          {showChartData ? eventName : zone}
        </h1>
        <h3 className='floating-info-box-zone-busyness-sub-header'> {zone} is <span style={{ color: textColour }}>{richText}</span></h3>
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
        {showNeighborhoodInfoBox && <p>There are no events happening in this neighbourhood.</p>}
      </div>
    )
  );  
}

export default FloatingInfoBox