import React, {useState} from 'react';
import "../App.css";
import { faUnderline } from '@fortawesome/free-solid-svg-icons';

function EventAnalysis({ eventForAnalysisComponent }) {

    // code to handle truncated text to increase screen real-estate

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
              
                {isTextShort ? 'See more' : 'See less'}
              </span>
            }
        </p>
      </div>
    );
  }

export default EventAnalysis