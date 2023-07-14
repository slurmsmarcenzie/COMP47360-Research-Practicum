import React from 'react';

function SplitViewController ({ isSplitView, setSplitView }) {

    return (
        <div className="split-view-controller">
            <button className='split-view-controller-toggle-button' onClick={() => setSplitView(!isSplitView)}>
                {isSplitView ? 'Return to Single Map View' : 'Show Splitview'}
            </button>
        </div>
    );
}

export default SplitViewController;