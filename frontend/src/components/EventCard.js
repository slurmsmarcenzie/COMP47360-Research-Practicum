import React from 'react';
import "../App.css";

function EventCard ({item, simulateBusynessChange}) {

    return(
        <div className='floating-info-box-event-card'>
            <h2>Name: {item.name}</h2>
            <h3>Parade Type: {item.type}</h3>
            <p>Expected Attendees: {item.expected_attendees}</p>
            <p>{item.description}</p>
            <button className='floating-nav-cta-button' onClick={simulateBusynessChange}>Calculate Event Impact</button>
        </div>
    )
}

export default EventCard