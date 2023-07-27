import React from 'react';
import "../App.css";


// import context
import { useMapContext } from './MapContext';

function MobileFloatingNav({map, isNeighbourhoodClickedRef, enableColours,  disableColours}) {

  const {isNavVisible, setIsNavVisible, setIsThereALiveInfoBox} = useMapContext();

  const {prunedEvents, setNeighbourhoodEvents, setShowInfoBox, setShowNeighborhoodInfoBox, setShowChartData, setZone, setEventName, isResetShowing, setIsResetShowing, removeAntline, removeMarker, removeAllButOneMarker} = useMapContext();

  const tileOptions = prunedEvents.map((event, index) => 
  <div 
    key={index}
    className="floating-nav-tile"
    onClick={() => {
      reviewEvent(event);
      setIsNavVisible(!isNavVisible);
      setIsThereALiveInfoBox(true);
      setIsMobileTileOpen(false);
    }}
    >
    {event.Event_ID}
  </div>
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

  const reviewEvent = (selectedEvent) => {
    const latitude = selectedEvent.Event_Location.Latitude;
    const longitude = selectedEvent.Event_Location.Longitude;

    setZone(selectedEvent.Zone_ID);

    floatingNavZoomToLocation(longitude, latitude);
    floatingNavSetLineWidth(selectedEvent.Zone_ID);
    disableColours();
    removeMarker();

    isNeighbourhoodClickedRef.current = true;

    setNeighbourhoodEvents([selectedEvent]);
    setShowInfoBox(true);
    setShowNeighborhoodInfoBox(false);
    setShowChartData(false);

    setEventName(selectedEvent.Event_Name);
    setIsResetShowing(true);
  };

    const {isMobileTileOpen, setIsMobileTileOpen} =useMapContext()

    return (
        <div className={`floating-nav ${isMobileTileOpen ? "open" : ""}`}>
          <h3 className='floating-nav-header-text'>Explore events in Manhattan and their impact on urban flow</h3>
          <div className='floating-nav-tiles'>
            {tileOptions}
          </div>
          {isResetShowing &&
            <button className="floating-nav-outline-button" onClick={() => { removeAntline(map.current); enableColours(); removeMarker();}}>Reset Map</button>
          }
        </div>
    );
}

export default MobileFloatingNav