import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import Map from 'react-map-gl';
import SplitViewController from './SplitViewController';
import { MapContext } from './SplitViewMapWrapper';

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiaGFycnlvY2xlaXJpZ2giLCJhIjoiY2xpdzJmMzNjMWV2NDNubzd4NTBtOThzZyJ9.m_TBrBXxkO0y0GjEci199g';

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
  
  function SplitViewMap({isSplitView, setSplitView, renderNeighbourhoods, neighbourhoods}) {

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

    const onLeftMapLoad = useCallback(map => {
        leftMapRef.current = map;
        renderNeighbourhoods();
      }, [renderNeighbourhoods, neighbourhoods]);
    
    const onRightMapLoad = useCallback(map => {
        rightMapRef.current = map;
        renderNeighbourhoods();
    }, [renderNeighbourhoods, neighbourhoods]);
    
    useEffect(() => {
        if (leftMapRef.current) {
          leftMapRef.current.on('load', () => onLeftMapLoad(leftMapRef.current, 'left'));
        }
        if (rightMapRef.current) {
          rightMapRef.current.on('load', () => onRightMapLoad(rightMapRef.current, 'right'));
        }
      }, []);
  
    return (
      <>
        <div style={{position: 'relative', height: '100vh'}}>

          <Map
            id="left-map"
            {...viewState}
            padding={leftMapPadding}
            onMoveStart={onLeftMoveStart}
            onMove={activeMap === 'left' ? onMove : undefined}
            onLoad={onLeftMapLoad}
            style={LeftMapStyle}
            mapStyle="mapbox://styles/mapbox/light-v9"
            mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
          />

          <Map
            id="right-map"
            {...viewState}
            padding={rightMapPadding}
            onMoveStart={onRightMoveStart}
            onMove={activeMap === 'right' ? onMove : undefined}
            onLoad={onRightMapLoad}
            style={RightMapStyle}
            mapStyle="mapbox://styles/mapbox/dark-v9"
            mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
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