import React from 'react';
import "../App.css";

function FloatingNav({setShowInfoBox, setNeighbourhoodEvents, prunedEvents, floatingNavZoomToLocation, floatingNavSetLineWidth, isNeighbourhoodClickedRef, disableColours, changeColourScheme, enableColours, setShowNeighborhoodInfoBox, setZone}) {

  const dropDownOptions = prunedEvents.map((event, index) => 
    <option key={index} value={JSON.stringify(event)}>
      {event.Event_Name}  
    </option>
  );

  const reviewEvent = (e) => {
    const selectedEvent = JSON.parse(e.target.value);

    const latitude = selectedEvent.Event_Location.Latitude
    const longitude = selectedEvent.Event_Location.Longitude

    setZone(selectedEvent.Zone_Name);
    floatingNavZoomToLocation(longitude, latitude);
    floatingNavSetLineWidth(selectedEvent.Zone_ID);
    isNeighbourhoodClickedRef.current = true;
    disableColours();
    setNeighbourhoodEvents([selectedEvent]);
    setShowInfoBox(true);
    setShowNeighborhoodInfoBox(true);
  };

    return(
        <div className='floating-nav'>
          <form className='floating-nav-form'>
            <select className='floating-nav-dropdown' onChange={reviewEvent}>
              <option value="" disabled selected>Select an event</option>
              {dropDownOptions}
            </select>
          </form>
          <button className="floating-nav-outline-button" onClick={enableColours}>Reset</button>
          <button className="floating-nav-outline-button" onClick={changeColourScheme}>Change Colours</button>
        </div>
    )
}

export default FloatingNav