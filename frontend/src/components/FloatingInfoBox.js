import React, {useState, useEffect} from 'react';
import EventCard from './EventCard';
import NeighbourhoodChartData from './NeighbourhoodChartData';
import EventAnalysis from './EventAnalysis';
import "../App.css";
import { useMapContext } from './MapContext';
import { scaleLinear } from 'd3-scale';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

function FloatingInfoBox( {map, visualiseEventImpact, highlightEventImpact, originalBusynessHashMap, eventBaselineHashMap, busynessHashMap, hashMapOfDifference, colours, resetColours, updateLayerColours, isNeighbourhoodClickedRef, showNoEventInfobox, setShowNoEventInfobox, eventSelected, setEventSelected}) {

  const {showInfoBox, showChartData, showChart, showNeighborhoodInfoBox, neighbourhoodEvents, colourPairs, colourPairIndex, removeAntline} = useMapContext();

  const {zoneID, setZoneID, eventName, setEventName, zone, setZone, useOriginal, removeMarker} = useMapContext();

  const {setShowInfoBox, setShowNeighborhoodInfoBox, setShowChart, setShowChartData} = useMapContext();

  const {neighbourhoods, originalLat, originalLng, setNeighbourhoodEvents, showAllMarkers, setShowMatchingEvent} = useMapContext();

  const {eventForAnalysisComponent, setEventForAnalysisComponent} = useMapContext();

  const {setIsFloatingNavVisible, setIsTimelapseVisible, isTimelapseVisible} = useMapContext();
  
  const [richText, setRichText] = useState(null);
  const [textColour, setTextColour] = useState(null);

  // when the neighbourhood events changes/if they change/ then set the zone id to the zone id value of the first item in the events list, as they will all have the same value

  const resetMap = (map) => {
    setShowNeighborhoodInfoBox(false);
    setEventSelected(false);
    setShowChart(false);
    setShowNoEventInfobox(true); 
    setIsTimelapseVisible(false);
    setShowMatchingEvent(true);
    setShowInfoBox(false);
    setShowChartData(false);
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
    if(neighbourhoodEvents && neighbourhoodEvents.length > 0 && !eventSelected) {
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
      <EventCard 
        key = {i}
        event={event}
        visualiseEventImpact={visualiseEventImpact}
        map={map}
      />
      )
  }) : null;

  function renderHeader() {
    return (
      <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
        <button className='floating-info-box-back-button' onClick={() => {
          removeAntline(map.current)
          resetMap(map);
          removeMarker();
          setIsFloatingNavVisible(true);
        }}>
          <FontAwesomeIcon icon={faArrowLeft} /> <span style={{marginRight: '8px'}}>Go Back</span>
        </button>
        {eventSelected 
          ? (isTimelapseVisible 
              ? <button className='floating-info-box-show-hide-timelapse' onClick={() => setIsTimelapseVisible(!isTimelapseVisible)}> 
                  <FontAwesomeIcon icon={faEyeSlash} /> <span style={{marginRight: '8px'}}>Hide Timelapse </span>
                </button> 
              : <button className='floating-info-box-show-hide-timelapse' onClick={() => setIsTimelapseVisible(!isTimelapseVisible)}>
                  <FontAwesomeIcon icon={faEye} /> <span style={{marginRight: '8px'}}> Show Timelapse</span>
                </button>) 
          : null 
        }
      </div>
    );
  }
  
  function renderZoneInfo() {
    return (
      <h1 className='floating-info-box-zone-header'>
        {showChartData ? eventName : zone}
      </h1>
    );
  }
  
  function renderChartOrAnalysis() {
  
    if (!showChartData) {
      return <h3 className='floating-info-box-zone-busyness-sub-header'> {zone} is <span style={{ color: textColour }}>{richText}</span></h3>;
    }
  
    return showChart ? null : <EventAnalysis eventForAnalysisComponent={eventForAnalysisComponent} showChart={showChart}/>;
  }


  function renderInfoBoxContent() {

    if (!showInfoBox) {
      return null;
    }
  
    if (showChartData) {
      return (
        <NeighbourhoodChartData 
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

    if (showNeighborhoodInfoBox == false || showNoEventInfobox == false) {
      return 
    } else {
      return <p style={{padding: '0 8px'}}>There are no events happening in this neighbourhood.</p>;
    }
  }
  
  return (

    (showInfoBox || showNeighborhoodInfoBox) && (
      <div className='floating-info-box'>
        {renderHeader()}
        {renderZoneInfo()}
        {renderChartOrAnalysis()} 
        {renderInfoBoxContent()}
        {renderNeighborhoodMessage()}
      </div>
    )
  );
}

export default FloatingInfoBox