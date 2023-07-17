import React from 'react';
import "../App.css";
import { useMapContext } from './MapContext';

function EventAnalysis ({}) {

    const {} = useMapContext();

    // swap out the generic text
    
    return (
        <div className='floating-info-box-event-analysis'>
            <p>St. Patrick's Day significantly increases Manhattan's activity levels. The parade route along Fifth Avenue becomes a major hub, swelling foot traffic and boosting local businesses, especially hospitality venues. Road closures alter transportation patterns, intensifying usage of public transit and ride-hailing services. Cultural events across neighborhoods add to the overall buzz. However, the impact varies by area and can cause temporary disruptions to normal routines. In essence, St. Patrick's Day transforms Manhattan into an even more bustling hub of festivity and commerce.</p>
        </div>
    )
}

export default EventAnalysis