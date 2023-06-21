// Core dependencies of App
import React, { useEffect, useRef,useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { scaleLinear } from 'd3-scale';
import * as turf from '@turf/turf'; // Make sure to install this library using npm or yarn

// Components
import FloatingNav from './FloatingNav';
import FloatingInfoBox from './FloatingInfoBox';

// Data
import neighbourhoods from '../geodata/nyc-taxi-zone.geo.json';
import events from '../geodata/events.json';

//Note: the following lines are important to create a production build that includes mapbox
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;

let popup;
let isNeighbourhoodClicked = false;

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiaGFycnlvY2xlaXJpZ2giLCJhIjoiY2xpdzJmMzNjMWV2NDNubzd4NTBtOThzZyJ9.m_TBrBXxkO0y0GjEci199g';

function Map() {

  const layerIds = useRef([]);
  const [colourPairIndex, setColourPairIndex] = useState(0);
  const [showInfoBox, setShowInfoBox] = useState(false);
  const [neighbourhoodEvents, setNeighbourhoodEvents] = useState([]);

  const colourPairs = [
    ["#008000", "#FF0000"],  // Red to Green 
    ["#800080", "#FFA500"],  // Orange to Purple
    ["#FF00FF", "#008080"],  // Teal to Magenta
    ["#8e2add", "#08fb26"],  // Green to Orange
    ["#fffc00", "#ff3300"],  // Yellow to Orange
    ["#01b4fd", "#6b03d8"],  // Skyblue to Deep Blue
    ["#000000", "#fe019a"],  // Pink to Black
  ];

  const mapContainer = useRef(null);
  const map = useRef(null);
  const originalLat = 40.7484;
  const originalLng = -73.9857;
  const zoom = 6;

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
    setColourPairIndex(prevIndex => (prevIndex + 2) % colourPairs.length);
    handleChangeColours();
  }

  function disableColours(){
    neighbourhoods.features.forEach((neighbourhood) => {
      map.current.setPaintProperty(neighbourhood.id, 'fill-opacity', 0);
    });
  }

  function enableColours(){

    setShowInfoBox(false);

    setNeighbourhoodEvents([]);

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

      map.current.flyTo({zoom: 12, essential: true, center: [originalLng, originalLat] });

      console.log(neighbourhoods.features)

      // loop over the neighborhoods and create a new layer for each
      neighbourhoods.features.forEach((neighbourhood) => {

        // add a random score between 0 and 1 to each neighborhood
        const score = Math.random();

        // get color corresponding to score
        const colour = colourScale(score);

        // set this as an attribute of the neighbourhood object
        neighbourhood.colour = colour;

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
            }
        });

        // event listeners on our map for mouseover and mouseleave

        popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false
        });
        // when mouse is over layer fill the opacity to full and set the line width to 4
        // when the mouse is removed from a layer revert the states back to their default.

        map.current.on('mouseover', layerId, function(e){

          popup.remove();

          console.log(neighbourhoods.features)
        
          if (!isNeighbourhoodClicked) {

            map.current.getCanvas().style.cursor = 'pointer';
            map.current.setPaintProperty(layerId, 'fill-opacity', 0.9);
            map.current.setPaintProperty(lineLayerId, 'line-width', 4);

            console.log(score);
            
            popup.setLngLat(e.lngLat).setHTML(neighbourhood.properties.zone, score).addTo(map.current);

          }
        });
        
        map.current.on('mouseleave', layerId, function(){

          if (!isNeighbourhoodClicked) {

            map.current.getCanvas().style.cursor = '';
            map.current.setPaintProperty(layerId, 'fill-opacity', 0.6);
            map.current.setPaintProperty(lineLayerId, 'line-width', 0);

          }
        })
      });
    });

    map.current.on('click', (e) => {

      popup.remove();
          
      const features = map.current.queryRenderedFeatures(e.point);

      if (features.length > 0 && features[0].id !== undefined) {

        isNeighbourhoodClicked = true;  
        
        disableColours()

        const [firstFeature] = features;
        
        // Create a GeoJSON feature object from the clicked feature
        const geojsonFeature = turf.feature(firstFeature.geometry);
    
        // Use turf to calculate the centroid of the feature
        const centroid = turf.centroid(geojsonFeature);
    
        // Get the coordinates of the centroid
        const [lng, lat] = centroid.geometry.coordinates;
    
        // Fly to the centroid of the polygon
        map.current.flyTo({ center: [lng, lat], zoom: 15 });

        map.current.setPaintProperty(firstFeature.id, 'fill-opacity', 0);

        const matchingEvents = events.filter(event => event.location_id === firstFeature.id);

        setNeighbourhoodEvents(matchingEvents);

        if (matchingEvents.length > 0) {
          setShowInfoBox(true);
        }
      }
    });

    events.forEach((event) =>{
      const marker = new mapboxgl.Marker()
      .setLngLat([event.location.longitude, event.location.latitude])
      .addTo(map.current);

      const markerElement = marker.getElement();

      markerElement.addEventListener('click', () => {
        console.log(event);
      });
  
      markerElement.addEventListener('mouseover', () => {
        markerElement.style.cursor = 'pointer';
      });
  
      markerElement.addEventListener('mouseout', () => {
        markerElement.style.cursor = 'default';
      })
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
          neighbourhoodEvents = {neighbourhoodEvents}
        />
    </div>
  );
};

export default Map;
