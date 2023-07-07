import React from 'react';
import "../App.css";

function EventCard ({item, calculateEventImpact, setShowChartData}) {

    return (
        <div className='floating-info-box-event-card'>
            <h2>Name: {item.Event_Name}</h2>
            <h3>Event Type: {item.Event_Type}</h3>
            <p>Expected Attendees: {item.expected_attendees}</p>
            <p>{item.description}</p>
            <button className='floating-nav-cta-button' onClick={() => {
                calculateEventImpact();
                setShowChartData(true);
            }}>Calculate Event Impact</button>
        </div>
    )
}

export default EventCard