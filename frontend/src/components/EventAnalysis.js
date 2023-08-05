import React, {useState} from 'react';
import "../App.css";

function EventAnalysis({ eventForAnalysisComponent, showChart }) {

    const [isTextShort, setIsTextShort] = useState(true);
  
    const toggleIsTextShort = () => {
        setIsTextShort(!isTextShort);
    };
  
    const getShortText = (text) => {
        return text.length > 200 ? text.substring(0, 200) + "...  " : text;
    };
  
    return (
      <div className='floating-info-box-event-analysis'>
        <p>
          {isTextShort ? getShortText(eventForAnalysisComponent.Event_Impact_Analysis) : eventForAnalysisComponent.Event_Impact_Analysis}
            <span>       </span>
            {eventForAnalysisComponent.Event_Impact_Analysis.length > 200 && 
              <span style={{color: 'white', cursor: 'pointer', textDecoration: 'underline'}} onClick={toggleIsTextShort}>
              
                {isTextShort ? 'Show more' : 'Show less'}
              </span>
            }
        </p>
      </div>
    );
  }

export default EventAnalysis