import React from 'react';

function SplitViewController ({ isSplitView, setSplitView }) {

    return (
        <div className="split-view-controller">
            <h3>Side by Side</h3>
            <button className='floating-infobox-box-toggle-button' onClick={() => setSplitView(!isSplitView)}>
                {isSplitView ? 'Show Original' : 'Show Splitview'}
            </button>
        </div>
    );
}

export default SplitViewController;