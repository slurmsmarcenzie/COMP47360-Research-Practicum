// Core dependencies of App
import React, { useEffect, useRef,useState, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { scaleLinear } from 'd3-scale';
import * as turf from '@turf/turf'; // Make sure to install this library using npm or yarn

// Components

// Data
import neighbourhoods from '../geodata/nyc-taxi-zone.geo.json';
import neighborhoodscores from '../geodata/output.json'
import events from '../geodata/events.json';

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiaGFycnlvY2xlaXJpZ2giLCJhIjoiY2xpdzJmMzNjMWV2NDNubzd4NTBtOThzZyJ9.m_TBrBXxkO0y0GjEci199g';

function MobileMap() {

  const [colourPairIndex, setColourPairIndex] = useState(0);
  const [showInfoBox, setShowInfoBox] = useState(false);
  const [neighbourhoodEvents, setNeighbourhoodEvents] = useState([]);
  const [eventsMap, setEventsMap] = useState({});
  const [scores, setScores] = useState(neighborhoodscores);
  
  const mapContainer = useRef(null);
  const map = useRef(null);
  const popup = useRef(null);
  const layerIds = useRef([]);
  const isNeighbourhoodClickedRef = useRef(false);

  const originalLat = 40.7484;
  const originalLng = -73.9857;
  const zoom = 8;

  const colourPairs = [
    ["#008000", "#FF0000"],
    ["#800080", "#FFA500"],
    ["#FF00FF", "#008080"],
    ["#8e2add", "#08fb26"],
    ["#fffc00", "#ff3300"],
    ["#01b4fd", "#6b03d8"],
    ["#000000", "#fe019a"],
  ];

  const colourScale = scaleLinear().domain([0, 1]).range(colourPairs[colourPairIndex]);

  const busynessMap = useMemo(() => {
    return scores.reduce((map, item) => {
      map[item.location_id] = item.busyness_score;
      return map;
    }, {});
  }, [scores]);  // Dependency array

  const simulateBusynessChange = () => {

    const newScores = scores.map(score => ({
      ...score,
      busyness_score: Math.random()  // this generates a random number between 0 and 1
    }));

    // set the new scores array
    setScores(newScores);
  };
  
  const add3DBuildings = () => {
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
  };

  const renderNeighbourhoods = () => {

    // loop over the neighborhoods and create a new layer for each
    neighbourhoods.features.forEach((neighbourhood) => {

      // construct the layer ID
      const layerId = `${neighbourhood.properties.location_id}`;

      // add new properties to our neighbourhood objects so that we can reuse them later (on hover effect)
      neighbourhood.id = layerId;

      // add the layer ID to our array so we can tell which neighbourhood/layer is being hovered etc.
      layerIds.current.push(layerId);

      // add new line id to our neighbourhood objects so that we can reuse them later (on hover effect)
      const lineLayerId = layerId + '-line';

      // add two distinct layer types:
      // 1. Fill layer -> we will use this to colour in our boundaries
      // 2. Line layer -> we will use this layer to highlight the borders of our boundaries on hover
      
      if (!map.current.getLayer(layerId)) {
        map.current.addLayer({
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

      if (!map.current.getLayer(lineLayerId)) {

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
            'line-width-transition': { duration: 600 }, // .6 second transition
          }
        });
      }    
    });
  }

  const renderEvents = () => {

    events.forEach((event) =>{

      const marker = new mapboxgl.Marker().setLngLat([event.location.longitude, event.location.latitude]).addTo(map.current);

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
  };

  const handleChangeColours = () => {

    // Create a new colourScale each time you handle the color change
    const colourScale = scaleLinear().domain([0, 1]).range(colourPairs[colourPairIndex]);
  
    neighbourhoods.features.forEach((neighbourhood) => {
      // get the original score assigned to our neighbourhood.
      const score = neighbourhood.score;
      // get color corresponding to score
      const newColour = colourScale(score);
      // set the 'fill-color' property on the layer to the new color
      map.current.setPaintProperty(neighbourhood.id, 'fill-color', newColour);
    });
  }

  const changeColourScheme = () => {
    console.log(colourPairIndex);
    setColourPairIndex(prevIndex => (prevIndex + 1) % colourPairs.length);
    handleChangeColours();
  }

  const disableColours = () => {
    neighbourhoods.features.forEach((neighbourhood) => {
      map.current.setPaintProperty(neighbourhood.id, 'fill-opacity', 0);
    });
  }

  const enableColours = () => {

    setShowInfoBox(false);
    setNeighbourhoodEvents([]);

    isNeighbourhoodClickedRef.current = false; // use setIsNeighbourhoodClicked
  
    neighbourhoods.features.forEach((neighbourhood) => {
      map.current.setPaintProperty(neighbourhood.id, 'fill-opacity', 0.6);
      map.current.setPaintProperty(neighbourhood.id + '-line', 'line-width', 0);
    });
  
    map.current.flyTo({zoom: 12, essential: true, center: [originalLng, originalLat] });
  }

  const updateLayerColours = () => {
    console.log('updateLayerColours is being accessed');
  
    if (!map.current || !busynessMap) return; // Added a check for busynessMap
  
    // Get the current map's style
    const style = map.current.getStyle();
  
    layerIds.current.forEach(layerId => {
      // Check if the layer exists in the style before trying to update it
      if (style.layers.some(layer => layer.id === layerId)) {
        const score = busynessMap[layerId];
        if (score !== undefined) { // Check if the score is defined before using it
          const newColor = colourScale(score);
          map.current.setPaintProperty(layerId, 'fill-color', newColor);
        }
      } else {
        console.warn(`Layer with ID ${layerId} doesn't exist`);
      }
    });
  };

  const initialiseMapEvents = () => {

    layerIds.current.forEach((layerId) => {
        const lineLayerId = layerId + '-line'; 
  
        // Touchstart event
        map.current.on('touchstart', layerId, (e) => {
          if (!isNeighbourhoodClickedRef.current) {
            map.current.getCanvas().style.cursor = 'pointer';
            map.current.setPaintProperty(layerId, 'fill-opacity', 0.9);
            map.current.setPaintProperty(lineLayerId, 'line-width', 4);
            
            const features = map.current.queryRenderedFeatures(e.point, { layers: [layerId] });
  
            if (features.length > 0) {
              if (!popup.current) {
                  popup.current = new mapboxgl.Popup({
                      closeButton: false,
                      closeOnClick: false,
                  });
              }
  
              const feature = features[0];
              const zone = feature.properties.zone; 
  
              popup.current.setLngLat(e.lngLat)
                  .setHTML(`${zone}, ${layerId}`)
                  .addTo(map.current);
            }
          }
        });
  
        // Touchend event
        map.current.on('touchend', layerId, () => {
          if (!isNeighbourhoodClickedRef.current) {
            map.current.getCanvas().style.cursor = '';
            map.current.setPaintProperty(layerId, 'fill-opacity', 0.6);
            map.current.setPaintProperty(lineLayerId, 'line-width', 0);
  
            if (popup.current) {
              popup.current.remove();
              popup.current = null;
            }
          }
        });
  

      map.current.on('click', (e) => {

        popup.current?.remove();

        const features = map.current.queryRenderedFeatures(e.point);

        if (features.length > 0 && features[0].id !== undefined) {
            
          isNeighbourhoodClickedRef.current = true;  
            
          disableColours();

          const [firstFeature] = features;
            
          // Create a GeoJSON feature object from the clicked feature
          const geojsonFeature = turf.feature(firstFeature.geometry);
  
          // Use turf to calculate the centroid of the feature
          const centroid = turf.centroid(geojsonFeature);
  
          // Get the coordinates of the centroid
          const [lng, lat] = centroid.geometry.coordinates;
  
          // Fly to the centroid of the polygon
          map.current.flyTo({ center: [lng, lat], zoom: 15, essential: true });

          map.current.setPaintProperty(firstFeature.id, 'fill-opacity', 0);

          const matchingEvents = eventsMap[firstFeature.id] || events.filter(event => event.location_id === firstFeature.id);

          setNeighbourhoodEvents(matchingEvents);

          if (matchingEvents.length > 0) {
            setShowInfoBox(true);
            }
          }
      });
    });
  }

  useEffect(() => {
    if (!map.current) {
      mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [originalLng, originalLat],
        zoom: zoom
      });
  
      map.current.on('load', () => {
        map.current.flyTo({zoom: 12, essential: true, center: [originalLng, originalLat] });
        add3DBuildings();
        renderNeighbourhoods();
        renderEvents();
        initialiseMapEvents();
        updateLayerColours();
      });
    }
  }, []);
  
  useEffect(() => {
    if (map.current) {
      if (map.current.isStyleLoaded()) {
        updateLayerColours();
      } else {
        map.current.on('style.load', updateLayerColours);
      }
    }
  
    return () => {
      if (map.current) {
        map.current.off('style.load', updateLayerColours);
      }
    }
  }, [scores]);
  
  
  useEffect(() => {
    console.log('Busyness Map Updated:', busynessMap);
  }, [busynessMap]);  
    return(
        <div ref={mapContainer} style={{ width: '100%', height: '100vh' }} />
    )
};

export default MobileMap