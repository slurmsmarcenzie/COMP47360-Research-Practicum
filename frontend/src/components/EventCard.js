import React from 'react';
import "../App.css";
import NeighbourhoodChartData from './NeighbourhoodChartData';

function EventCard ({item, simulateBusynessChange, hashMap, showChartData, setShowChartData}) {
    
    console.log(hashMap);
    console.log(showChartData);

    return showChartData ? 
      <NeighbourhoodChartData hashMap={hashMap} /> : 
      (
        <div className='floating-info-box-event-card'>
            <h2>Name: {item.name}</h2>
            <h3>Parade Type: {item.type}</h3>
            <p>Expected Attendees: {item.expected_attendees}</p>
            <p>{item.description}</p>
            <button className='floating-nav-cta-button' onClick={() => setShowChartData(true)}>
              Calculate Event Impact
            </button>
        </div>
    )
}

export default EventCard