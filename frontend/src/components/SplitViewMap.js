import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import Map from 'react-map-gl';
import mapboxgl from 'mapbox-gl';
import SplitViewController from '../components/SplitViewController'
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapContext } from './MapContext';
import { scaleLinear } from 'd3-scale';

const LeftMapStyle = {
    position: 'absolute',
    width: '50%',
    height: '100vh'
  };
  
  const RightMapStyle = {
    position: 'absolute',
    left: '50%',
    width: '50%',
    height: '100vh'
  };
  
function SplitViewMap({eventBaselineHashMap, busynessHashMap, initialiseMouseMapEvents}) {

  const {MAPBOX_ACCESS_TOKEN, isSplitView, setSplitView, renderNeighbourhoods} = useMapContext();

  const {updateLayerColours} = useMapContext();

  const {colourPairs, colourPairIndex, neighbourhoods} = useMapContext();

  const leftMapRef = useRef();
  const rightMapRef = useRef();
  const popup = useRef(null);

  const [viewState, setViewState] = useState({
    longitude: -73.9857,
    latitude: 40.7484,
    zoom: 12,
    pitch: 30
  });

  const [mode, setMode] = useState('side-by-side');
  const [activeMap, setActiveMap] = useState('left');

  const onLeftMoveStart = useCallback(() => setActiveMap('left'), []);
  const onRightMoveStart = useCallback(() => setActiveMap('right'), []);
  const onMove = useCallback(evt => setViewState(evt.viewState), []);

  const width = typeof window === 'undefined' ? 100 : window.innerWidth;

  const leftMapPadding = useMemo(() => {
    return {left: mode === 'split-screen' ? width / 1 : 0, top: 0, right: 0, bottom: 0};
  }, [width, mode]);

  const rightMapPadding = useMemo(() => {
    return {right: mode === 'split-screen' ? width / 1 : 0, top: 0, left: 0, bottom: 0};
  }, [width, mode]);

     // Map Event Listeners for mouse
  const handleSplitScreenMouseInteractions = (map, hashmap) => {

    // Create a new colourScale each time you handle the color change
    const colourScale = scaleLinear().domain([0, 0.4, 0.8]).range(colourPairs[colourPairIndex]);

    neighbourhoods.features.forEach((neighbourhood) => {

      // Mouseover event
      map.on('mousemove', neighbourhood.id, (e) => {

      map.getCanvas().style.cursor = 'pointer';
      map.setPaintProperty(neighbourhood.id, 'fill-opacity', 0.9);
      map.setPaintProperty(neighbourhood.id+'-line', 'line-width', 4);
      
      const features = map.queryRenderedFeatures(e.point, { layers: [neighbourhood.id] });

      if (features.length > 0) {

        if (!popup.current) {

            // code to allow the pop up to display a bit over our mouse interaction.

            const markerHeight = 10;
            const markerRadius = 10;
            const linearOffset = 5;
            const popupOffsets = {
            'top': [0, 0],
            'top-left': [0, 0],
            'top-right': [0, 0],
            'bottom': [0, -markerHeight],
            'bottom-left': [linearOffset, (markerHeight - markerRadius + linearOffset) * -1],
            'bottom-right': [-linearOffset, (markerHeight - markerRadius + linearOffset) * -1],
            'left': [markerRadius, (markerHeight - markerRadius) * -1],
            'right': [-markerRadius, (markerHeight - markerRadius) * -1]
            };

            // creating the popup object

            popup.current = new mapboxgl.Popup({
                offset: popupOffsets,
                closeButton: false,
                closeOnClick: false,
            });
          }

          const feature = features[0];
          const zone = feature.properties.zone; 

          const score = hashmap[neighbourhood.id]
          
          // Apply the busyness score to the color scale
          const textColour = colourScale(score);

          let richText;
          if (score < 0.29) {
              richText = 'Not Very Busy';
          } else if (score >= 0.29 && score < 0.4) {
              richText = 'Relatively Busy';
          } else if (score >= 0.4 && score < 0.7) {
              richText = 'Busy';
          } else {
              richText = 'Extremely Busy';
          }

          // Set the HTML content of the popup with the colored text
          popup.current.setLngLat(e.lngLat).setHTML(`${zone}: <span style="color: ${textColour}">${richText}</span>`).addTo(map);
        }

      });
  
      // Mouseleave event: this will be fired whenever the mouse leaves a feature in the specified layer.
      map.on('mouseleave', neighbourhood.id, () => {
            map.getCanvas().style.cursor = '';
            map.setPaintProperty(neighbourhood.id, 'fill-opacity', 0.6);
            map.setPaintProperty(neighbourhood.id+'-line', 'line-width', 0);

            if (popup.current) {
                popup.current.remove();
                popup.current = null;
            }
      });
    });
  }

  const onLeftMapLoad = useCallback((event) => {
    const map = event.target;
    leftMapRef.current = map;
    console.log('r', map);
    renderNeighbourhoods(map);
    updateLayerColours(map, true, eventBaselineHashMap, busynessHashMap)
    handleSplitScreenMouseInteractions(map, eventBaselineHashMap)
  }, [renderNeighbourhoods]);

  const onRightMapLoad = useCallback((event) => {
    const map = event.target;
    rightMapRef.current = map;
    console.log('r', map);
    renderNeighbourhoods(map);
    updateLayerColours(map, false, eventBaselineHashMap, busynessHashMap)
    handleSplitScreenMouseInteractions(map, busynessHashMap)
  }, [renderNeighbourhoods]);

  return (
    <>
      <div style={{position: 'relative', height: '100vh'}}>

        <Map
          id="left-map"
          {...viewState}
          padding={leftMapPadding}
          onMoveStart={onLeftMoveStart}
          onMove={activeMap === 'left' ? onMove : undefined}
          style={LeftMapStyle}
          mapStyle='mapbox://styles/mapbox/dark-v11'
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
          onLoad={map => onLeftMapLoad(map)} // Added this line
        />

        <Map
          id="right-map"
          {...viewState}
          padding={rightMapPadding}
          onMoveStart={onRightMoveStart}
          onMove={activeMap === 'right' ? onMove : undefined}
          style={RightMapStyle}
          mapStyle='mapbox://styles/mapbox/dark-v11'
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
          onLoad={map => onRightMapLoad(map)} // Added this line
        />

        <SplitViewController
          isSplitView={isSplitView}
          setSplitView={setSplitView}
        />

      </div>
    </>
  );
}

export default SplitViewMap;