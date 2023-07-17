import React from 'react';
import "../App.css";
import { useMapContext } from './MapContext';

function EventCard ({event, visualiseEventImpact}) {

    const {setShowChartData, removeAllButOneMarker} = useMapContext();
    
    return (
        <div className='floating-info-box-event-card'>
            <h2 style={{marginTop: '0px'}}>{event.Event_Name}</h2>
            <h3>Expected Attendees: {event.expected_attendees}</h3>
            <p>{event.description}</p>
            <button className='floating-nav-cta-button' onClick={() => {
                visualiseEventImpact(event.Event_ID);
                setShowChartData(true)
                removeAllButOneMarker(event.Event_ID)
            }}>Visualise Event Impact</button>
        </div>
    )
}

export default EventCard