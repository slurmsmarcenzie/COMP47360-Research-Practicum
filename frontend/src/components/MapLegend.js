const MapLegend = ({ colours, hoveredZoneScore}) => {

    const gradient = colours.join(', ');

    return (
        <div className='floating-map-legend-container'>
          <p className="floating-map-legend-container-header-text">Busyness Index</p>
          <div className="colour-scale-legend">
            <div className="gradient" style={{ background: `linear-gradient(to right, ${gradient})` }} ><div className="dot" style={{ left: `${hoveredZoneScore * 100}%` }}/></div>
            <div className="ticks-container">
              <p className="tick-label">Not Busy</p>
              <p className="tick-label">Very Busy</p>
            </div>
          </div>
        </div>
      );
    };
    
export default MapLegend;    