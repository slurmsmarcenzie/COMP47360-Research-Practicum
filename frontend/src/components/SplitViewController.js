import React from 'react';

function SplitViewController ({ isSplitView, setSplitView }) {

    return (
        <div className="split-view-controller">
            <h3>Side by Side</h3>
            <p>Synchronize two maps.</p>
            <button className='floating-infobox-box-toggle-button' onClick={() => setSplitView(!isSplitView)}>
                {isSplitView ? 'Show Original' : 'Show Splitview'}
            </button>
        </div>
    );
}

export default SplitViewController;