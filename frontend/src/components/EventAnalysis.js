import React from 'react';
import { useMapContext } from './MapContext';
import "../App.css";

function EventAnalysis({ eventForAnalysisComponent }) {
    
    console.log('eventForAnalysisComponent:', eventForAnalysisComponent);
  
    // Map over neighbourhoodEvents and create EventAnalysis components
  
    return (
      <div className='floating-info-box-event-analysis'>
        <p>{eventForAnalysisComponent.Event_Impact_Analysis }</p>
      </div>
    );
  }

export default EventAnalysis