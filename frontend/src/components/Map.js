// Core dependencies of App
import React, { useEffect, useRef,useState, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { scaleLinear } from 'd3-scale';
import * as turf from '@turf/turf'; // Make sure to install this library using npm or yarn

// Components
import FloatingNav from './FloatingNav';
import FloatingInfoBox from './FloatingInfoBox';
import MapLegend from './MapLegend';

// Data
import neighbourhoods from '../geodata/nyc-taxi-zone.geo.json';
import neighborhoodscores from '../geodata/output.json'
import events from '../geodata/events.json';

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiaGFycnlvY2xlaXJpZ2giLCJhIjoiY2xpdzJmMzNjMWV2NDNubzd4NTBtOThzZyJ9.m_TBrBXxkO0y0GjEci199g';

function Map() {

  const [colourPairIndex, setColourPairIndex] = useState(0);
  const [showInfoBox, setShowInfoBox] = useState(false);
  const [neighbourhoodEvents, setNeighbourhoodEvents] = useState([]);
  const [eventsMap, setEventsMap] = useState([]);
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
    ["#008000", "#FFBF00", "#FF0000"], // Green, Amber, Red
    ["#FFD700", "#9ACD32", "#008000"], // Green, Yellow Green, Yellow
    ["#FF69B4", "#C71585", "#800080"], // Purple, Medium Violet Red, Hot Pink
    ["#00BFFF", "#1E90FF", "#4169E1"], // Royal Blue, Dodger Blue, Deep Sky Blue
    ["#32CD32", "#228B22", "#006400"], // Dark Green, Forest Green, Lime Green
    ["#CD5C5C", "#B22222", "#8B0000"], // Dark Red, Firebrick, Indian Red
    ["#A9A9A9", "#696969", "#2F4F4F"], // Dark Slate Gray, Dim Gray, Dark Gray
    ["#BA55D3", "#9932CC", "#8B008B"], // Dark Magenta, Dark Orchid, Medium Orchid
    ["#4169E1", "#0000CD", "#191970"]  // Midnight Blue, Medium Blue, Royal Blue
  ];
  

  const colourScale = useMemo(() => {
    return scaleLinear().domain([0, 0.5, 1]).range(colourPairs[colourPairIndex]);
  }, [colourPairs, colourPairIndex]);

  // Define a memoized value 'busynessMap', which depends on 'scores'
  const busynessHashMap = useMemo(() => {
  
    // 'reduce' is a function that transforms an array into a single value.
    // In this case, it is transforming the 'scores' array into a single object
    return scores.reduce((map, item) => {
      
      // For each 'item' in 'scores', add a property to 'map' with a key of
      // 'item.location_id' and a value of 'item.busyness_score'
      map[item.location_id] = item.busyness_score;
      
      // Return the updated 'map' to be used in the next iteration of 'reduce'
      return map;
    }, {});  // The second argument to 'reduce' is the initial value of 'map', in this case, an empty object
  }, [scores]);  // The array of dependencies for 'useMemo'. 'busynessMap' will be recomputed whenever 'scores' changes
  
  
  const originalBusynessHashMap = useMemo(() => {
    return scores.reduce((map, item) => {
      map[item.location_id] = item.busyness_score;
      return map;
    }, {});
  }, []); // same code implementation except this will never update.

  // static methods for our application to load in all values

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

  // dynamic methods and interactive for our application to handle and set changes to our map

  const handleChangeColours = (colourPairIndex) => {

    // Create a new colourScale each time you handle the color change
    const colourScale = scaleLinear().domain([0, 0.5, 1]).range(colourPairs[colourPairIndex]);
  
    if (!map.current || !busynessHashMap) return; // Added a check for busynessMap
  
    // Get the current map's style
    const style = map.current.getStyle();
  
    layerIds.current.forEach(layerId => {
      // Check if the layer exists in the style before trying to update it
      if (style.layers.some(layer => layer.id === layerId)) {
        const score = busynessHashMap[layerId];
        if (score !== undefined) { // Check if the score is defined before using it
          const newColour = colourScale(score);
          map.current.setPaintProperty(layerId, 'fill-color', newColour);
        }
        else {
          console.warn(`Current layer does not have a score`);
        }
      } else {
        console.warn(`Layer with ID ${layerId} doesn't exist`);
      }
    })
  }

  const changeColourScheme = () => {
    console.log(colourPairIndex);
    setColourPairIndex(prevIndex => {
      const newIndex = (prevIndex + 1) % colourPairs.length;
      handleChangeColours(newIndex);
      return newIndex;
    });
  }

  const disableColours = () => {
    neighbourhoods.features.forEach((neighbourhood) => {
      map.current.setPaintProperty(neighbourhood.id, 'fill-opacity', 0);
    });
  }

  const enableColours = () => {

    setShowInfoBox(false);
    setNeighbourhoodEvents([]);

    isNeighbourhoodClickedRef.current = false; // user has reset the select function so we reset the map to default state.
  
    neighbourhoods.features.forEach((neighbourhood) => {
      map.current.setPaintProperty(neighbourhood.id, 'fill-opacity', 0.6);
      map.current.setPaintProperty(neighbourhood.id + '-line', 'line-width', 0);
    });
  
    map.current.flyTo({zoom: 12, essential: true, center: [originalLng, originalLat] });
  }

  const updateLayerColours = () => {
    console.log('updateLayerColours is being accessed');
  
    if (!map.current || !busynessHashMap) return; // Added a check for busynessMap
  
    // Get the current map's style
    const style = map.current.getStyle();
  
    layerIds.current.forEach(layerId => {
      // Check if the layer exists in the style before trying to update it
      if (style.layers.some(layer => layer.id === layerId)) {
        const score = busynessHashMap[layerId];
        if (score !== undefined) { // Check if the score is defined before using it
          const newColour = colourScale(score);
          map.current.setPaintProperty(layerId, 'fill-color', newColour);
        }
      } else {
        console.warn(`Layer with ID ${layerId} doesn't exist`);
      }
    });
  };

  const initialiseMouseMapEvents = () => {

    layerIds.current.forEach((layerId) => {
      const lineLayerId = layerId + '-line'; // Assuming each layerId has a corresponding line layer with '-line' appended to its id.

      // Mouseover event
      map.current.on('mousemove', layerId, (e) => {
        
          if (!isNeighbourhoodClickedRef.current) {

              map.current.getCanvas().style.cursor = 'pointer';
              map.current.setPaintProperty(layerId, 'fill-opacity', 0.9);
              map.current.setPaintProperty(lineLayerId, 'line-width', 4);
              
              const features = map.current.queryRenderedFeatures(e.point, { layers: [layerId] });

              if (features.length > 0) {

                  if (!popup.current) {

                    // code to allow the pop up to display a bit over our mouse interaction.

                    const markerHeight = 10;
                    const markerRadius = 10;
                    const linearOffset = 25;
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

                  popup.current.setLngLat(e.lngLat)
                      .setHTML(`${zone}, ${layerId}`)
                      .addTo(map.current);
              }
          }
      });
  
      // Mouseleave event: this will be fired whenever the mouse leaves a feature in the specified layer.
      map.current.on('mouseleave', layerId, () => {
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

          // check to see if a map belongs in our hashmap of events or otherwise filter by events that match the location id on each event by the current id of our zone
          const matchingEvents = eventsMap[firstFeature.id] || events.filter(event => event.location_id === firstFeature.id);

          setNeighbourhoodEvents(matchingEvents);

          if (matchingEvents.length > 0) {
            setShowInfoBox(true);
            }
          }
      });
    });
  }
  
  const simulateBusynessChange = () => {

    const newScores = scores.map(score => ({
      ...score,
      busyness_score: Math.random()  // this generates a random number between 0 and 1
    }));

    // set the new scores array
    setScores(newScores);
  };
  
  // Methods for children elements.
  const floatingNavZoomToLocation = (longitude, latitude) => {
    map.current.flyTo({
      center: [longitude, latitude],
      zoom: 15, // specify your desired zoom level
      essential: true
    });
  }

  const floatingNavSetLineWidth = (zone) => {

    const lineLayerId = zone + '-line';

    map.current.setPaintProperty(lineLayerId, 'line-width', 4);

  }
  // Dyanmic use effects re-render our app
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
        initialiseMouseMapEvents();
        updateLayerColours();
      });

      map.current.on('moveend', () => {

        let zoom = map.current.getZoom();

        console.log('current zoom is:', zoom)

        if (isNeighbourhoodClickedRef.current === true && map.current.getZoom() < 11) {
          
          enableColours();

        }
      });
    }
  }, []);
  
  // Define an effect that runs when the 'scores' prop changes
  useEffect(() => {
    
    console.log('This is the original map: ', originalBusynessHashMap);
    console.log('This is the dyanmic map: ', busynessHashMap);

    // If the 'current' property of 'map' is defined (i.e., the map instance exists)
    if (map.current) {
      
      // If the map's style is already loaded
      if (map.current.isStyleLoaded()) {
        
        // Update the layer colours on the map
        updateLayerColours();
      } else {
        // If the map's style is not yet loaded, set up an event listener to
        // update the layer colours once the style is loaded
        map.current.on('style.load', updateLayerColours);
      }
    }
  
    // Define a cleanup function that will run when the component unmounts, or
    // before this effect runs again
    return () => {
      
      // If the 'current' property of 'map' is defined
      if (map.current) {
        
        // Remove the event listener for the 'style.load' event to avoid
        // potential memory leaks
        map.current.off('style.load', updateLayerColours);
      }
    }
  }, [scores]); // This effect depends on 'scores'. It will run every time 'scores' changes

  

  return (

    <div ref={mapContainer} style={{ width: '100%', height: '100vh' }}>

      <MapLegend
        colours={colourPairs[colourPairIndex]} 
      />

      <FloatingNav 
        events = {events}
        disableColours = {disableColours}
        floatingNavZoomToLocation ={floatingNavZoomToLocation}
        floatingNavSetLineWidth = {floatingNavSetLineWidth}
        isNeighbourhoodClickedRef = {isNeighbourhoodClickedRef}
        changeColourScheme={changeColourScheme}
        enableColours={enableColours}
        simulateBusynessChange = {simulateBusynessChange}
        setNeighbourhoodEvents={setNeighbourhoodEvents}
        setShowInfoBox={setShowInfoBox}
        />

      <FloatingInfoBox
        showingFloatingInfoBox={showInfoBox}
        neighbourhoodEvents = {neighbourhoodEvents}
      />

    </div>

  );
};

export default Map;