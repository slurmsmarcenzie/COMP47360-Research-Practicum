import React from 'react';
import "../App.css";

function FloatingNav({calculateHashMapDifference, setShowInfoBox, setNeighbourhoodEvents, events, floatingNavZoomToLocation, floatingNavSetLineWidth, isNeighbourhoodClickedRef, disableColours, changeColourScheme, enableColours, simulateBusynessChange}) {

  const dropDownOptions = events.map((event, index) => 
    <option key={index} value={JSON.stringify(event)}>
      {event.name}  
    </option>
  );

  const reviewEvent = (e) => {
    const selectedEvent = JSON.parse(e.target.value);
    console.log(selectedEvent);

    const {latitude, longitude} = selectedEvent.location;

    floatingNavZoomToLocation(longitude, latitude);
    floatingNavSetLineWidth(selectedEvent.location_id);
    isNeighbourhoodClickedRef.current = true;
    disableColours();
    setNeighbourhoodEvents([selectedEvent]);
    setShowInfoBox(true);
  };

    return(
        <div className='floating-nav'>
          <form className='floating-nav-form'>
            <select className='floating-nav-dropdown' onChange={reviewEvent}>
              <option value="" disabled selected>Select an event</option>
              {dropDownOptions}
            </select>
          </form>
          <button className="floating-nav-cta-button" onClick={simulateBusynessChange}>Simulate Busyness Change</button>
          <button className="floating-nav-cta-button" onClick={calculateHashMapDifference}>Create Difference HM</button>
          <button className="floating-nav-outline-button" onClick={enableColours}>Reset</button>
          <button className="floating-nav-outline-button" onClick={changeColourScheme}>Change Colours</button>
        </div>
    )
}

export default FloatingNav