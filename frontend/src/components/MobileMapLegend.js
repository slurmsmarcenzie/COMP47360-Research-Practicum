const MobileMapLegend = ({ colours }) => {

    const gradient = colours.join(', ');

    return (
        <div className='floating-map-legend-container'>
          <div className="colour-scale-legend">
            <div className="gradient" style={{ background: `linear-gradient(to bottom, ${gradient})` }} >
                </div>
            </div>
          </div>
      );
    };
    
export default MobileMapLegend;    