import React, {useState} from 'react';
import "../App.css";

// import context
import { useMapContext } from './MapContext';

function FloatingNav({map, isNeighbourhoodClickedRef, enableColours}) {

  const {prunedEvents, removeAllLines, setNeighbourhoodEvents, setShowInfoBox, setShowNeighborhoodInfoBox, setShowChartData, setZone, setEventName, isResetShowing, setIsResetShowing, removeAntline, removeMarker, removeAllButOneMarker} = useMapContext();

  const dropDownOptions = prunedEvents.map((event, index) => 
    <option key={index} value={JSON.stringify(event)}>
      {event.Event_Name}  
    </option>
  );
  
  const floatingNavSetLineWidth = (zone) => {
      const lineLayerId = zone + '-line';
      map.current.setPaintProperty(lineLayerId, 'line-width', 4);
  } 

  const reviewEvent = (e) => {

    const selectedEvent = JSON.parse(e.target.value);

    removeAllLines(map.current)
    setZone(selectedEvent.Zone_ID);
    floatingNavSetLineWidth(selectedEvent.Zone_ID);
    removeMarker();
  
    isNeighbourhoodClickedRef.current = true;
    
    setNeighbourhoodEvents([selectedEvent]);
    setShowInfoBox(true);
    setShowNeighborhoodInfoBox(false);
    setShowChartData(false);

    setEventName(selectedEvent.Event_Name)
    setIsResetShowing(true)
    
  };

    return(
      
        <div className='floating-nav'>
          <h3 className='floating-nav-header-text'>Explore events in Manhattan and their impact on urban flow</h3>
          <form className='floating-nav-form'>
            <select className='floating-nav-dropdown' onChange={reviewEvent}>
              <option value="" disabled selected>Select an event</option>
              {dropDownOptions}
            </select>
          </form>
          {isResetShowing &&
          <button className="floating-nav-outline-button" onClick={() => { removeAntline(map.current); enableColours(); removeMarker();}}>Reset Map</button>
          }
  
  </div>
        
        
    )
}

export default FloatingNav