import React, {useState, useEffect} from 'react';
import MobileEventCard from './MobileEventCard';
import MobileNeighbourhoodChartData from './MobileNeighbourhoodChartData'
import EventAnalysis from './EventAnalysis';
import "../App.css";
import { useMapContext } from './MapContext';
import { scaleLinear } from 'd3-scale';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'

function MobileFloatingInfoBox( {map, visualiseEventImpact, highlightEventImpact, originalBusynessHashMap, eventBaselineHashMap, busynessHashMap, hashMapOfDifference, colours, resetColours, updateLayerColours, isNeighbourhoodClickedRef}) {
  
  const {showInfoBox, showChartData, showChart, showNeighborhoodInfoBox, neighbourhoodEvents, colourPairs, colourPairIndex, removeAntline, setIsThereALiveInfoBox} = useMapContext();

  const {zoneID, setZoneID, eventName, setEventName, zone, setZone, useOriginal} = useMapContext();

  const {setShowInfoBox, setShowNeighborhoodInfoBox, setShowChart, setShowChartData} = useMapContext();

  const {neighbourhoods, originalLat, originalLng, setNeighbourhoodEvents, showAllMarkers, setShowMatchingEvent} = useMapContext();

  const {eventForAnalysisComponent, setEventForAnalysisComponent} = useMapContext();

  const { setIsTimelapseVisible } = useMapContext();
  
  const [richText, setRichText] = useState(null);
  const [textColour, setTextColour] = useState(null);

  // when the neighbourhood events changes/if they change/ then set the zone id to the zone id value of the first item in the events list, as they will all have the same value

  const resetMap = (map) => {
    setIsTimelapseVisible(false);
    setIsThereALiveInfoBox(false);
    setShowMatchingEvent(true);
    setShowInfoBox(false);
    setShowNeighborhoodInfoBox(false);
    setShowChartData(false);
    setShowChart(false);
    setNeighbourhoodEvents([]);
    showAllMarkers(map.current);
    map.current.flyTo({zoom: 12, essential: true, center: [originalLng, originalLat] });
    updateLayerColours(map.current, true, originalBusynessHashMap, busynessHashMap);
    neighbourhoods.features.forEach((neighbourhood) => {
      map.current.setPaintProperty(neighbourhood.id, 'fill-opacity', 0.6);
      map.current.setPaintProperty(neighbourhood.id + '-line', 'line-width', 0);
    });
    isNeighbourhoodClickedRef.current = false; // user has reset the select function so we reset the map to default state.
  }

  useEffect(() => {
    if(neighbourhoodEvents && neighbourhoodEvents.length > 0) {
      setZoneID(neighbourhoodEvents[0].Zone_ID);
      setEventName(neighbourhoodEvents[0].Event_Name);
      setZone(neighbourhoodEvents[0].Zone_Name)
      setEventForAnalysisComponent(neighbourhoodEvents[0])
    }
    
  }, [neighbourhoodEvents]);

  useEffect(() => {
    const colourScale = scaleLinear().domain([0, 0.4, 0.8]).range(colourPairs[colourPairIndex]);
    const neighbourhoodBusyness = useOriginal ? eventBaselineHashMap[zoneID] : busynessHashMap[zoneID]
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
  }, [colourPairs, colourPairIndex, busynessHashMap, eventBaselineHashMap, zoneID]);
  
  const eventCards = neighbourhoodEvents ? neighbourhoodEvents.map((event, i) =>{
    return (
      <MobileEventCard 
        key = {i}
        event={event}
        visualiseEventImpact={visualiseEventImpact}
        map={map}
      />
      )
  }) : null;

  function renderHeader() {
    return (
      <div style={{display: 'flex', alignItems: 'left', width: '100%'}}>
        <button className='floating-info-box-back-button-mobile' onClick={() => {
          removeAntline(map.current)
          resetMap(map);
        }}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h2 className='floating-info-box-zone-header-mobile'>
            {showChartData ? eventName : zone}
        </h2>
      </div>
    );
  }
  
  function renderChartOrAnalysis() {
  
    if (!showChartData) {
      return <h4 style={{width: '100%'}}className='floating-info-box-zone-busyness-sub-header-mobile'> {zone} is <span style={{ color: textColour }}>{richText}</span></h4>;
    }
  
    return showChart ? null : <EventAnalysis eventForAnalysisComponent={eventForAnalysisComponent}/>;
  }
  
  
  function renderInfoBoxContent() {
    if (!showInfoBox) {
      return null;
    }
  
    if (showChartData) {
      return (
        <MobileNeighbourhoodChartData 
          map={map}
          hashMap={hashMapOfDifference}
          busynessHashMap={busynessHashMap}
          eventBaselineHashMap={eventBaselineHashMap}
          colours={colours}
          highlightEventImpact={highlightEventImpact}
          zoneID={zoneID}
          resetColours={resetColours}
        />
      );
    }
  
    return eventCards;

  }
  
  function renderNeighborhoodMessage() {
    return showNeighborhoodInfoBox && <p>There are no events happening in this neighbourhood.</p>;
  }
  
  const {isDrawerOpen} = useMapContext();

  return (
    (showInfoBox || showNeighborhoodInfoBox) && (
      <div className={`floating-info-box ${isDrawerOpen ? "open" : ""}`}>
        {renderHeader()}
        {renderChartOrAnalysis()}
        {renderInfoBoxContent()}
        {renderNeighborhoodMessage()}
      </div>
    )
  );
}

export default MobileFloatingInfoBox;