import React from 'react';
import "../App.css";

function EventCard ({item, calculateEventImpact, setShowChartData}) {

    return (
        <div className='floating-info-box-event-card'>
            <h2>Area: {item.Zone_Name}</h2>
            <h3>Expected Attendees: {item.expected_attendees}</h3>
            <p>{item.description}</p>
            <button className='floating-nav-cta-button' onClick={() => {
                calculateEventImpact();
                setShowChartData(true);
            }}>Calculate Event Impact</button>
        </div>
    )
}

export default EventCard