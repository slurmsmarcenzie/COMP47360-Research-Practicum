import React from 'react';
import { useMapContext } from './MapContext';
import "../App.css";

function EventAnalysis({ eventForAnalysisComponent }) {
  
    return (
      <div className='floating-info-box-event-analysis'>
        <p>{eventForAnalysisComponent.Event_Impact_Analysis }</p>
      </div>
    );
  }

export default EventAnalysis