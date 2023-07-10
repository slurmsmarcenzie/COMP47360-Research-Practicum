import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import Map from 'react-map-gl';
import SplitViewController from '../components/SplitViewController'
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapContext } from './MapContext';

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
  
function SplitViewMap({originalBusynessHashMap, busynessHashMap, initialiseMouseMapEvents}) {

  const {MAPBOX_ACCESS_TOKEN, isSplitView, setSplitView, renderNeighbourhoods} = useMapContext();

  const {updateLayerColours} = useMapContext();

  const leftMapRef = useRef();
  const rightMapRef = useRef();

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

  const onLeftMapLoad = useCallback((event) => {
    const map = event.target;
    leftMapRef.current = map;
    console.log('r', map);
    renderNeighbourhoods(map);
    updateLayerColours(map, true, originalBusynessHashMap, busynessHashMap)
    initialiseMouseMapEvents(map)
  }, [renderNeighbourhoods, initialiseMouseMapEvents]);

  const onRightMapLoad = useCallback((event) => {
    const map = event.target;
    rightMapRef.current = map;
    console.log('r', map);
    renderNeighbourhoods(map);
    updateLayerColours(map, false, originalBusynessHashMap, busynessHashMap)
    initialiseMouseMapEvents(map)
  }, [renderNeighbourhoods, initialiseMouseMapEvents]);

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
          mapStyle="mapbox://styles/mapbox/light-v9"
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
          mapStyle="mapbox://styles/mapbox/dark-v9"
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