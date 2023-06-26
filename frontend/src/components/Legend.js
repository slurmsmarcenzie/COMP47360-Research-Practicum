import React from 'react';

function Legend({ layers, colours }) {
  return (
    <div id="legend">
      {layers.current.map((layer, i) => {
        const color = colours[i];
        const item = (
          <div key={i}>
            <span 
              className="legend-key" 
              style={{ backgroundColor: color }}>
            </span>
            <span>{layer}</span>
          </div>
        );
        return item;
      })}
    </div>
  );
}

export default Legend;
