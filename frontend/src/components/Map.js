// Core dependencies of App
import React, { useEffect, useRef,useState, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { scaleLinear } from 'd3-scale';
import * as turf from '@turf/turf'; // Make sure to install this library using npm or yarn

// Components
import FloatingNav from './FloatingNav';
import Navbar from './Navbar';
import FloatingInfoBox from './FloatingInfoBox';
import MapLegend from './MapLegend';
import SplitViewMap from './SplitViewMap';

// Data
import neighbourhoods from '../geodata/nyc-taxi-zone.geo.json';
// import neighborhoodscores from '../geodata/output.json'
// import events from '../geodata/events.json';
import prunedEvents from '../geodata/prunedEvents.json'

// Wrapper
import { MapProvider } from './SplitViewMapWrapper';

// Note: the following lines are important to create a production build that includes mapbox
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
// mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiaGFycnlvY2xlaXJpZ2giLCJhIjoiY2xpdzJmMzNjMWV2NDNubzd4NTBtOThzZyJ9.m_TBrBXxkO0y0GjEci199g';
const BASE_API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';

function Map() {

  const [colourPairIndex, setColourPairIndex] = useState(0);
  const [showInfoBox, setShowInfoBox] = useState(false);
  const [showNeighborhoodInfoBox, setShowNeighborhoodInfoBox] = useState(false);
  const [neighbourhoodEvents, setNeighbourhoodEvents] = useState([]);
  const [eventsMap, setEventsMap] = useState([]);
  const [scores, setScores] = useState(null);
  const [originalBusynessHashMap, setOriginalBusynessHashMap] = useState(null);
  const [hashMapOfDifference, setHashMapOfDifference] = useState(null);
  const [zone, setZone] = useState(null);
  const [showChartData, setShowChartData] = useState(false);
  const [error, setError] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [isSplitView, setSplitView] = useState(false);
  
  const mapContainer = useRef(null);
  const map = useRef(null);
  const popup = useRef(null);
  const layerIds = useRef([]);
  const isNeighbourhoodClickedRef = useRef(false);
  const retryCount = useRef(0);

  const originalLat = 40.7484;
  const originalLng = -73.9857;
  const zoom = 7;
  const pitch = 30;

  // define a new function that will be used as the event listener
  const updateLayerColoursAfterLoad = () => updateLayerColours(false);

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

    if (!scores) return {};  
  
    // 'reduce' is a function that transforms an array into a single value.
    // In this case, it is transforming the 'scores' array into a single object
    return scores.reduce((map, item) => {
      
      // For each 'item' in 'scores', add a property to 'map' with a key of
      // 'item.location_id' and a value of 'item.busyness_score'
      map[item.location_id] = item.busyness_score;
      
      // Return the updated 'map' to be used in the next iteration of 'reduce'
      return map;
    }, {});  
    
    // The second argument to 'reduce' is the initial value of 'map', in this case, an empty object
  }, [scores]);  // The array of dependencies for 'useMemo'. 'busynessMap' will be recomputed whenever 'scores' changes
  

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

  // marker methods and customisation

  const renderEvents = () => {

    const newMarkers = []; // array to hold our new markers

    prunedEvents.forEach((event) =>{
        const marker = new mapboxgl.Marker().setLngLat([event.Event_Location.Longitude, event.Event_Location.Latitude]).addTo(map.current);
        const markerElement = marker.getElement();

        markerElement.addEventListener('click', () => {
            console.log(event);
        });

        markerElement.addEventListener('mouseover', () => {
            markerElement.style.cursor = 'pointer';
        });

        markerElement.addEventListener('mouseout', () => {
            markerElement.style.cursor = 'default';
        });

        newMarkers.push(marker); // Push the marker to the array of new markers
      });

      setMarkers(newMarkers); // Update the state with the new markers
  };

  const removeAllMarkers = () => {

    markers.forEach((marker) => {
        marker.remove(); // Remove the marker from the map
    });

    setMarkers([]); // Clear the markers array
  };

  const removeAllButOneMarker = (keptEvent) => {

    markers.forEach(({ event, marker }) => {
      if (event !== keptEvent) {
        marker.remove();
      }
    });

    setMarkers(markers.filter(({ event }) => event === keptEvent));
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

    setShowChartData(false);
    setShowInfoBox(false);
    setShowNeighborhoodInfoBox(false);
    setNeighbourhoodEvents([]);
    updateLayerColours(true);

    isNeighbourhoodClickedRef.current = false; // user has reset the select function so we reset the map to default state.
  
    neighbourhoods.features.forEach((neighbourhood) => {
      map.current.setPaintProperty(neighbourhood.id, 'fill-opacity', 0.6);
      map.current.setPaintProperty(neighbourhood.id + '-line', 'line-width', 0);
    });
  
    map.current.flyTo({zoom: 12, essential: true, center: [originalLng, originalLat] });
  }

  const resetColours = () => {

    neighbourhoods.features.forEach((neighbourhood) => {
      map.current.setPaintProperty(neighbourhood.id, 'fill-opacity', 0.6);
      map.current.setPaintProperty(neighbourhood.id + '-line', 'line-width', 0);
    });

    isNeighbourhoodClickedRef.current = false; // allow for on hover effects to be resumed

  }

  const updateLayerColours = (isOriginalHashMap) => {
  
    if (!map.current || !busynessHashMap) return; // Added a check for busynessMap
  
    // Get the current map's style
    const style = map.current.getStyle();
  
    layerIds.current.forEach(layerId => {
      // Check if the layer exists in the style before trying to update it
      if (style.layers.some(layer => layer.id === layerId)) {
        const score = isOriginalHashMap ? originalBusynessHashMap[layerId] : busynessHashMap[layerId]
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
          const zone = firstFeature.properties.zone;

          // check to see if a map belongs in our hashmap of events or otherwise filter by events that match the location id on each event by the current id of our zone
          const matchingEvents = eventsMap[firstFeature.id] || prunedEvents.filter(event => event.Zone_ID === firstFeature.id);

          setNeighbourhoodEvents(matchingEvents);

          if (matchingEvents.length > 0) {
            setShowInfoBox(true);
            } else {
              // Show the neighborhood info box since there are no matching events
              setShowNeighborhoodInfoBox(true);
            }

            setZone(zone);
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

  const calculateHashMapDifference = () => {

    if (!busynessHashMap || !originalBusynessHashMap) {
      return;
    }

    let temporaryHashMap = {};
  
    for (let key in busynessHashMap) {
      if (originalBusynessHashMap.hasOwnProperty(key)) {
        temporaryHashMap[key] = busynessHashMap[key] - originalBusynessHashMap[key];
      } else {
        temporaryHashMap[key] = busynessHashMap[key];
      }
    }
  
    setHashMapOfDifference(temporaryHashMap);
  };

  const calculateEventImpact = () => {

    setNeighbourhoodEvents([]);

    isNeighbourhoodClickedRef.current = false; // user has reset the select function so we reset the map to default state.
  
    neighbourhoods.features.forEach((neighbourhood) => {
      map.current.setPaintProperty(neighbourhood.id, 'fill-opacity', 0.6);
      map.current.setPaintProperty(neighbourhood.id + '-line', 'line-width', 0);
    });


  
    map.current.flyTo({zoom: 12, essential: true, center: [originalLng, originalLat] });

    setTimeout(() => {
      simulateBusynessChange();
    }, 600)
  
  }

  const highlightEventImpact = (Zone_ID, labels) => {

    console.log(labels)
  
    isNeighbourhoodClickedRef.current = true; // disable on hover and write replacement code below for on highlight impact
  
    layerIds.current.forEach((layerId) => {
      let opacity = labels.includes(layerId) ? 0.7 : 0.1;
      let line = labels.includes(layerId) ? 1 : 0;
      map.current.setPaintProperty(layerId, 'fill-opacity', opacity);
      map.current.setPaintProperty(layerId + '-line', 'line-width', line);
  
      map.current.off('mousemove', layerId);
      map.current.off('mouseleave', layerId);
  
      if (labels.includes(layerId)) {
  
        map.current.on('mousemove', layerId, (e) => {
  
          map.current.getCanvas().style.cursor = 'pointer';
          map.current.setPaintProperty(layerId, 'fill-opacity', 0.9);
          map.current.setPaintProperty(layerId + '-line', 'line-width', 4);
  
          const features = map.current.queryRenderedFeatures(e.point, { layers: [layerId] });
  
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
  
            popup.current.setLngLat(e.lngLat)
                .setHTML(`${zone}, ${layerId}`)
                .addTo(map.current);
          }
        }); // close the mousemove event block
  
        map.current.on('mouseleave', layerId, () => {
          if (labels.includes(layerId)) {
            map.current.getCanvas().style.cursor = '';
            map.current.setPaintProperty(layerId, 'fill-opacity', opacity);
            map.current.setPaintProperty(layerId + '-line', 'line-width', line);
          }
  
          if (popup.current) {
              popup.current.remove();
              popup.current = null;
          }
        }); // close the mouseleave event block
  
      } // close the labels.includes(layerId) block
  
    }); // close the forEach block
  
    map.current.setPaintProperty(Zone_ID, 'fill-opacity', 0.7);
    map.current.setPaintProperty(Zone_ID + '-line', 'line-width', 4);
  
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
  
  useEffect(() => {
    const fetchScores = async () => {
  
      const formattedDate = new Date().toISOString().slice(0,10);
      
      try {
        const response = await fetch(`${BASE_API_URL}/predict/${formattedDate}`);
        if (!response.ok) { throw new Error('Network response was not ok'); }
        const data = await response.json();
        setScores(data);
        console.log(data);
      } 
      
      catch (err) {
        if (retryCount.current < 3) {
          retryCount.current++;
          setTimeout(() => {fetchScores()}, 10000);
        } else {
          setError('Failed to fetch scores after three attempts');
        }
      }
    };
  
    fetchScores();
  
  }, []);

  useEffect(() => {
    if (!originalBusynessHashMap && Object.keys(busynessHashMap).length > 0) {
      setOriginalBusynessHashMap({ ...busynessHashMap });
    }
  }, [busynessHashMap, originalBusynessHashMap]);

  useEffect(() => {
    calculateHashMapDifference();
  }, [busynessHashMap]); // This means the effect will rerun whenever busynessHashMap changes

  useEffect(() => {

    // check that there is no map and that the scores have been successfully 
    // retrieved by the fetch api before we create a map
    
    if (!map.current && scores) {
      mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [originalLng, originalLat],
        zoom: zoom,
        pitch: 30
      });

      map.current.on('load', () => {
        map.current.flyTo({zoom: 12, essential: true, center: [originalLng, originalLat] });
        add3DBuildings();
        renderNeighbourhoods();
        renderEvents();
        initialiseMouseMapEvents();
        setTimeout(() => {
          updateLayerColours(false)
        }, 500);
      });

      map.current.on('moveend', () => {

        if (isNeighbourhoodClickedRef.current === true && map.current.getZoom() < 12) {
          
          // enableColours(); rewrite this function as currently crashes app.
          
        }
        
      });
    }
  }, [scores]);  // This effect runs when scores is fetched

  // Define an effect that runs when the 'scores' prop changes
  useEffect(() => {

    // If the 'current' property of 'map' is defined (i.e., the map instance exists)
    if (map.current) {
      
      // If the map's style is already loaded
      if (map.current.isStyleLoaded()) {
        
        // Update the layer colours on the map
        updateLayerColours(false)
      } else {
        // If the map's style is not yet loaded, set up an event listener to
        // update the layer colours once the style is loaded
        map.current.on('style.load', updateLayerColoursAfterLoad);
      }
    }
  
    // Define a cleanup function that will run when the component unmounts, or
    // before this effect runs again
    return () => {
      
      // If the 'current' property of 'map' is defined
      if (map.current) {
        
        // Remove the event listener for the 'style.load' event to avoid
        // potential memory leaks
        map.current.off('style.load', updateLayerColoursAfterLoad);
      }
    }
  }, [scores]); // This effect depends on 'scores'. It will run every time 'scores' changes

  const toggleView = () => {
    setSplitView(prevState => !prevState); // Function to toggle the map view
  };

  return (

    <div>
        
        <div ref={mapContainer} style={{ width: '100%', height: '100vh' }}>

        {isSplitView ? (
          <MapProvider>
            <SplitViewMap 
            isSplitView={isSplitView}
            setSplitView={setSplitView}
            neighbourhoods={neighbourhoods}
            renderNeighbourhoods={renderNeighbourhoods}
            />
          </MapProvider>
        ) : (
          <>

          <Navbar />

          <FloatingNav 
            prunedEvents = {prunedEvents}
            zone={zone}
            disableColours = {disableColours}
            floatingNavZoomToLocation ={floatingNavZoomToLocation}
            floatingNavSetLineWidth = {floatingNavSetLineWidth}
            isNeighbourhoodClickedRef = {isNeighbourhoodClickedRef}
            changeColourScheme={changeColourScheme}
            enableColours={enableColours}
            simulateBusynessChange = {simulateBusynessChange}
            setNeighbourhoodEvents={setNeighbourhoodEvents}
            setShowInfoBox={setShowInfoBox}
            setShowNeighborhoodInfoBox={setShowNeighborhoodInfoBox}
            setZone={setZone}
            updateLayerColours={updateLayerColours}
            />

          <FloatingInfoBox
            showingFloatingInfoBox={showInfoBox}
            showingNeighborHoodInfoBox={showNeighborhoodInfoBox}
            neighbourhoodEvents={neighbourhoodEvents}
            zone={zone}
            setZone={setZone}
            hashMapOfDifference={hashMapOfDifference}
            showChartData={showChartData}
            setShowChartData={setShowChartData}
            calculateEventImpact={calculateEventImpact}
            colours={colourPairs[colourPairIndex]}
            highlightEventImpact={highlightEventImpact}
            updateLayerColours={updateLayerColours}
            resetColours={resetColours}
            isSplitView={isSplitView}
            setSplitView={setSplitView}
          />

          <MapLegend
            colours={colourPairs[colourPairIndex]} 
          />

          </>
        )}
      </div>

    </div>

  );
};

export default Map;
