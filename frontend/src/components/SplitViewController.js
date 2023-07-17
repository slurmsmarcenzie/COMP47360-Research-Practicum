import React from 'react';
import { useMapContext } from './MapContext';

function SplitViewController ({ isSplitView, setSplitView }) {

    const {setEventForAnalysisComponent} = useMapContext();

    return (
        <div className="split-view-controller">
            <button className='split-view-controller-toggle-button' onClick={() => {
                setSplitView(!isSplitView);
                setEventForAnalysisComponent([]);
            }}>
                {isSplitView ? 'Return to Single Map View' : 'Show Splitview'}
            </button>
        </div>
    );
}

export default SplitViewController;
