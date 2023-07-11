import React from 'react';
import "../App.css";
import { useMapContext } from './MapContext';
import { type } from '@testing-library/user-event/dist/type';

function EventCard ({item, visualiseEventImpact}) {

    const {setShowChartData, removeAllMarkers, removeAllButOneMarker} = useMapContext();

    return (
        <div className='floating-info-box-event-card'>
            <h2>Area: {item.Zone_Name}</h2>
            <h3>Expected Attendees: {item.expected_attendees}</h3>
            <p>{item.description}</p>
            <button className='floating-nav-cta-button' onClick={() => {
                visualiseEventImpact(item.Event_ID);
                setShowChartData(true)
                // removeAllMarkers();
                removeAllButOneMarker(item.Event_ID)
            }}>Visualise Event Impact</button>
        </div>
    )
}

export default EventCard