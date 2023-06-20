import React from 'react';
import "../App.css";

function EventCard (props) {

    return(
        <div className='floating-info-box-event-card'>
            <h3>Name: {props.item.name}</h3>
            <h4>Parade Type: {props.item.type}</h4>
            <p>Expected Attendees: {props.item.expected_attendees}</p>
            <p>{props.item.description}</p>
        </div>
    )
}

export default EventCard