import React from 'react';
import "../App.css";
import { useMapContext } from './MapContext';
import antline from '../geodata/antline.geo.json'

//comment
function EventCard ({event, visualiseEventImpact, map}) {

    const {setShowChartData, removeAllButOneMarker, addAntline, removeAntline, addMarker} = useMapContext();
    const findAntlineEventById = (eventId) => {
        return antline.features.find((feature) => feature.properties.event_id === eventId);
      };
    
    return (
        <div className='floating-info-box-event-card'>
            <h2 style={{marginTop: '0px'}}>{event.Event_Name}</h2>
            <h3>Expected Attendees: {event.expected_attendees}</h3>
            <p>{event.description}</p>
            <button className='floating-nav-cta-button' onClick={() => {
                removeAntline(map.current)
                visualiseEventImpact(event.Event_ID);
                setShowChartData(true)
                removeAllButOneMarker(event.Event_ID)

                const antlineEvent = findAntlineEventById(event.Event_ID);

                setTimeout(() => {addAntline(map.current, antlineEvent)
                    },
                1000)
                
                const lastCoordinates = antlineEvent.geometry.coordinates[antlineEvent.geometry.coordinates.length - 1];
                addMarker(map.current, lastCoordinates);
            }}>Visualise Event Impact</button>
        </div>
    )
}

export default EventCard