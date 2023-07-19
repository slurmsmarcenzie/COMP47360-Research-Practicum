import React, {useEffect} from 'react';
import { useMapContext } from './MapContext';

function SplitViewController ({ isSplitView, setSplitView }) {

    const { setEventForAnalysisComponent, setShowChart, neighbourhoodEvents} = useMapContext();
    
    useEffect(() => {
        if(neighbourhoodEvents && neighbourhoodEvents.length > 0) {
          setEventForAnalysisComponent(neighbourhoodEvents[0])
        }
      }, [neighbourhoodEvents]);

    return (
        <div className="split-view-controller">
            <button className='split-view-controller-toggle-button' onClick={() => {
                setShowChart(false);
                setSplitView(!isSplitView);
            }}>
                {isSplitView ? 'Return to Single Map View' : 'Show Splitview'}
            </button>
        </div>
    );
}

export default SplitViewController;
