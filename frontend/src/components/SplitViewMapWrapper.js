import React, { createContext, useState, useCallback, useContext } from "react";
import neighbourhoods from '../geodata/nyc-taxi-zone.geo.json';

export const MapContext = createContext();

export const MapProvider = ({ children }) => {
    
  const [neighbourhoods, setNeighbourhoods] = useState([]);
  const [layerIds, setLayerIds] = useState([]);
  
  const renderNeighbourhoods = useCallback((map) => {

    neighbourhoods.forEach((neighbourhood) => {

      const layerId = `${neighbourhood.properties.location_id}`;
  
      neighbourhood.id = layerId;
  
      setLayerIds(layerIds.concat(layerId));
  
      const lineLayerId = layerId + '-line';
      
      if (!map.getLayer(layerId)) {
        map.addLayer({
          id: layerId,
          type: 'fill',
          source: {
            type: 'geojson',
            data: neighbourhood
          },
          paint: {
            'fill-color': '#888', // fill color
            'fill-opacity-transition': { duration: 600 }, // .6 second transition
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              0.9,
              0.6
            ],
          }
        });
      }
  
      if (!map.getLayer(lineLayerId)) {
        map.addLayer({
          id: lineLayerId,
          type: 'line',
          source: {
            type: 'geojson',
            data: neighbourhood
          },
          paint: {  
            'line-color': '#ffffff',
            'line-width': 0,
            'line-width-transition': { duration: 600 }, // .6 second transition
          }
        });
      }    
    });
  }, [neighbourhoods, layerIds]); 

  return (
    <MapContext.Provider value={{ neighbourhoods, setNeighbourhoods, layerIds, setLayerIds, renderNeighbourhoods }}>
      {children}
    </MapContext.Provider>
  );
};
