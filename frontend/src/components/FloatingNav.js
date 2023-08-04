import React, {useState} from 'react';
import "../App.css";
import LineChart from './LineChart';

// import context
import { useMapContext } from './MapContext';

function FloatingNav({map, isNeighbourhoodClickedRef, enableColours,  disableColours}) {

  const {prunedEvents, setNeighbourhoodEvents, setShowInfoBox, setShowNeighborhoodInfoBox, setShowChartData, setZone, setEventName, isResetShowing, setIsResetShowing, removeAntline, removeMarker, removeAllButOneMarker} = useMapContext();

  const dropDownOptions = prunedEvents.map((event, index) => 
    <option key={index} value={JSON.stringify(event)}>
      {event.Event_Name}  
    </option>
  );
  
  const floatingNavZoomToLocation = (longitude, latitude) => {
    map.current.flyTo({
      center: [longitude, latitude],
      zoom: 15, // specify your desired zoom level
      essential: true
    });
  }
  
  const floatingNavSetLineWidth = (zone) => {
      const lineLayerId = zone + '-line';
      map.current.setPaintProperty(lineLayerId, 'line-width', 4);
  } 

  const reviewEvent = (e) => {

    const selectedEvent = JSON.parse(e.target.value);
    // const latitude = selectedEvent.Event_Location.Latitude
    // const longitude = selectedEvent.Event_Location.Longitude
    
    setZone(selectedEvent.Zone_ID);

    // floatingNavZoomToLocation(longitude, latitude);
    floatingNavSetLineWidth(selectedEvent.Zone_ID);
    // disableColours();
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