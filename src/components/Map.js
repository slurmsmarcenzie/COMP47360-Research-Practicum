import React, { useEffect, useRef,useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { scaleLinear } from 'd3-scale';
import neighbourhoods from '../geodata/nyc-taxi-zone.geo.json';
import FloatingNav from './FloatingNav';
import FloatingInfoBox from './FloatingInfoBox';
import * as turf from '@turf/turf'; // Make sure to install this library using npm or yarn

let isNeighbourhoodClicked = false;

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiaGFycnlvY2xlaXJpZ2giLCJhIjoiY2xpdzJmMzNjMWV2NDNubzd4NTBtOThzZyJ9.m_TBrBXxkO0y0GjEci199g';

function Map() {

  const layerIds = useRef([]);
  const [colourPairIndex, setColourPairIndex] = useState(0);
  const [showInfoBox, setShowInfoBox] = useState(false);

  const colourPairs = [
    ["#FF0000", "#008000"],  // Red to Green 
    ["#FFA500", "#800080"],  // Orange to Purple
    ["#008080", "#FF00FF"],  // Teal to Magenta
    ["#08fb26", "#8e2add"],  // Green to Orange
    ["#ff3300", "#fffc00"],  // Yellow to Orange
    ["#6b03d8", "#01b4fd"],  // Skyblue to Deep Blue
    ["#fe019a", "#000000"],  // Pink to Black
  ];

  const mapContainer = useRef(null);
  const map = useRef(null);
  const originalLat = 40.7484;
  const originalLng = -73.9857;
  const zoom = 12;

  // Create color scale
  const colourScale = scaleLinear()
    .domain([0, 1])
    .range(colourPairs[colourPairIndex]); // range of colors between which our data will be mapped  

  function handleChangeColours() {
    // for each neighbourhood
    neighbourhoods.features.forEach((neighbourhood) => {
      // get the original score assigned to our neighbourhood.
      const score = neighbourhood.score;
      // get color corresponding to score
      const newColour = colourScale(score);
      // set the 'fill-color' property on the layer to the new color
      map.current.setPaintProperty(neighbourhood.id, 'fill-color', newColour);
    });
  }

  function changeColourScheme(){
    setColourPairIndex(prevIndex => (prevIndex + 1) % colourPairs.length);
    handleChangeColours();
  }

  function disableColours(){
    neighbourhoods.features.forEach((neighbourhood) => {
      map.current.setPaintProperty(neighbourhood.id, 'fill-opacity', 0);
    });
  }

  function enableColours(){

    setShowInfoBox(false);

    isNeighbourhoodClicked = false;
        
    neighbourhoods.features.forEach((neighbourhood) => {
      map.current.setPaintProperty(neighbourhood.id, 'fill-opacity', 0.6);
      const lineLayerID = neighbourhood.id + '-line'; // or whatever property holds the layer id
      map.current.setPaintProperty(lineLayerID, 'line-width', 0);
    });

    map.current.flyTo({zoom: 12, essential: true, center: [originalLng, originalLat] });
  }

  useEffect(() => {
    if (map.current) return;

    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [originalLng, originalLat],
      zoom: zoom
    });

    map.current.on('load', () => {
      // loop over the neighborhoods and create a new layer for each
      neighbourhoods.features.forEach((neighbourhood) => {

        // add a random score between 0 and 1 to each neighborhood
        const score = Math.random();
        // get color corresponding to score
        const colour = colourScale(score);

        // construct the layer ID
        const layerId = `${neighbourhood.properties.location_id}`;

        // add new properties to our neighbourhood objects so that we can reuse them later (on hover effect)
        neighbourhood.id = layerId;

        // we want to remember the score so that the relative colour score on our scale will be retained.
        neighbourhood.score = score;

        // add the layer ID to our array so we can tell which neighbourhood/layer is being hovered etc.
        layerIds.current.push(layerId);

        // add new line id to our neighbourhood objects so that we can reuse them later (on hover effect)
        const lineLayerId = layerId + '-line';

        // add two distinct layer types:
        // 1. Fill layer -> we will use this to colour in our boundaries
        // 2. Line layer -> we will use this layer to highlight the borders of our boundaries on hover

        map.current.addLayer({
          id: layerId,
          type: 'fill',
          source: {
            type: 'geojson',
            data: neighbourhood
          },
          paint: {
            'fill-color': colour, // fill color
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              0.9,
              0.6
            ]
          }
        });

        map.current.addLayer({
          id: lineLayerId,
          type: 'line',
          source: {
            type: 'geojson',
            data: neighbourhood
          },
          paint: {  
            'line-color': '#ffffff',
            'line-width': 0,
          }
        });

        map.current.addLayer({
          'id': 'add-3d-buildings',
          'source': 'composite',
          'source-layer': 'building',
          'filter': ['==', 'extrude', 'true'],
          'type': 'fill-extrusion',
          'minzoom': 15,
          'paint': {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
            }},
          );

        // event listeners on our map for mouseover and mouseleave
        // when mouse is over layer fill the opacity to full and set the line width to 4
        // when the mouse is removed from a layer revert the states back to their default.

        map.current.on('mouseover', layerId, function(){
          if (!isNeighbourhoodClicked) {
            map.current.getCanvas().style.cursor = 'pointer';
            map.current.setPaintProperty(layerId, 'fill-opacity', 0.9);
            map.current.setPaintProperty(lineLayerId, 'line-width', 4);
          }
        });
        
        map.current.on('mouseleave', layerId, function(){
          if (!isNeighbourhoodClicked) {
            map.current.getCanvas().style.cursor = '';
            map.current.setPaintProperty(layerId, 'fill-opacity', 0.6);
            map.current.setPaintProperty(lineLayerId, 'line-width', 0);
          }
        })

        map.current.on('click', (e) => {
          
          const features = map.current.queryRenderedFeatures(e.point);

          console.log('this is features: ', features)

          if (features.length > 0 && features[0].id !== undefined) {

            isNeighbourhoodClicked = true;  

            setShowInfoBox(true);
            
            disableColours()

            const [firstFeature] = features;
            
            console.log('First feature: ', firstFeature)

            // Create a GeoJSON feature object from the clicked feature
            const geojsonFeature = turf.feature(firstFeature.geometry);
        
            // Use turf to calculate the centroid of the feature
            const centroid = turf.centroid(geojsonFeature);
        
            // Get the coordinates of the centroid
            const [lng, lat] = centroid.geometry.coordinates;
        
            // Fly to the centroid of the polygon
            map.current.flyTo({ center: [lng, lat], zoom: 15 });

            map.current.setPaintProperty(firstFeature.id, 'fill-opacity', 0);

            // const popup = new mapboxgl.Popup()
            //   .setLngLat([lng, lat])
            //   .setHTML('<h3>Area Info</h3>' + '<p>' + firstFeature.properties.zone + '</p>')
            //   .addTo(map.current);
            
          }
        });
      });
    });
  }, []);


  return (
    <div ref={mapContainer} style={{ width: '100%', height: '100vh' }}>
      <FloatingNav 
        changeColourScheme={changeColourScheme}
        enableColours={enableColours}
        />
        <FloatingInfoBox
          showingFloatingInfoBox={showInfoBox}
        />
    </div>
  );
};

export default Map;
