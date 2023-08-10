import React from 'react';
import "../App.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDove, faGhost, faClover, faRainbow, faChampagneGlasses, faMoon, faCrown, faBurst} from '@fortawesome/free-solid-svg-icons';

// import context
import { useMapContext } from './MapContext';

function MobileFloatingNav({map, isNeighbourhoodClickedRef,  disableColours}) {

  const {isNavVisible, setIsNavVisible, setIsThereALiveInfoBox} = useMapContext();

  const {prunedEvents, setNeighbourhoodEvents, setShowInfoBox, setShowNeighborhoodInfoBox, setShowChartData, setZone, setEventName, isResetShowing, setIsResetShowing, removeAntline, removeMarker, removeAllButOneMarker} = useMapContext();

  const tileIcons = [faDove, faGhost, faClover, faRainbow, faChampagneGlasses, faMoon, faCrown, faBurst]

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
    <FontAwesomeIcon style={{width: '24px', height: '24px'}} icon={tileIcons[index % tileIcons.length]} />
  </div>
);
    
  const floatingNavSetLineWidth = (zone) => {
      const lineLayerId = zone + '-line';
      map.current.setPaintProperty(lineLayerId, 'line-width', 4);
  } 

  const reviewEvent = (selectedEvent) => {
 
    setZone(selectedEvent.Zone_ID);
    floatingNavSetLineWidth(selectedEvent.Zone_ID);
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
        </div>
    );
}

export default MobileFloatingNav