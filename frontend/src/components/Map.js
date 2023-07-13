// Core dependencies of App
import React, { useEffect, useRef,useState, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { scaleLinear } from 'd3-scale';
import * as turf from '@turf/turf'; // Make sure to install this library using npm or yarn

// Context builder
import { useMapContext } from './MapContext';

// Components
import FloatingNav from './FloatingNav';
import Navbar from './Navbar';
import FloatingInfoBox from './FloatingInfoBox';
import MapLegend from './MapLegend';
import SplitViewMap from './SplitViewMap';

// Note: the following lines are important to create a production build that includes mapbox
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
// mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;

function Map() {

  // foundations
  const {MAPBOX_ACCESS_TOKEN, BASE_API_URL} = useMapContext();

  // imported base functions
  const { add3DBuildings, renderNeighbourhoods, updateLayerColours, renderEvents, showAllMarkers, setEventName} = useMapContext();

  // add arrays
  const {neighbourhoods, prunedEvents} = useMapContext();

  // import base states
  const { colourPairIndex, setColourPairIndex, colourPairs, setNeighbourhoodEvents, eventsMap, setZone, setError, isSplitView} = useMapContext();
  
  // states to conditional render components
  const {setShowInfoBox, setShowNeighborhoodInfoBox, setShowChart, setShowChartData, setZoneID} = useMapContext();

  // magic numbers
  const { originalLat, originalLng, zoom, pitch } = useMapContext();

  // map specific states
  const [scores, setScores] = useState(null);
  const [originalBusynessHashMap, setOriginalBusynessHashMap] = useState(null);
  const [baselineEventBusynessHashMap, setBaselineEventBusynessHashMap] = useState(null);
  const [hashMapOfDifference, setHashMapOfDifference] = useState(null);

  // objects for our map
  const mapContainer = useRef(null);
  const map = useRef(null);
  const popup = useRef(null);
  const isNeighbourhoodClickedRef = useRef(false);
  
  // flimsy counter replace later
  const retryCount = useRef(0);

  // define a new function that will be used as the event listener
  const updateLayerColoursAfterLoad = () => updateLayerColours(map.current, false, originalBusynessHashMap, busynessHashMap);

  // Change of Colour Handling
  const enableColours = () => {

    setShowInfoBox(false);
    setShowNeighborhoodInfoBox(false);
    setShowChartData(false);
    setShowChart(false);
    setNeighbourhoodEvents([]);
    showAllMarkers(map.current);

    updateLayerColours(map.current, true, originalBusynessHashMap, busynessHashMap);

    isNeighbourhoodClickedRef.current = false; // user has reset the select function so we reset the map to default state.
  
    neighbourhoods.features.forEach((neighbourhood) => {
      map.current.setPaintProperty(neighbourhood.id, 'fill-opacity', 0.6);
      map.current.setPaintProperty(neighbourhood.id + '-line', 'line-width', 0);
    });
  
    map.current.flyTo({zoom: 12, essential: true, center: [originalLng, originalLat] });

  }

  const disableColours = () => {
    neighbourhoods.features.forEach((neighbourhood) => {
      map.current.setPaintProperty(neighbourhood.id, 'fill-opacity', 0);
    });
  }

  const resetColours = () => {

    neighbourhoods.features.forEach((neighbourhood) => {
      map.current.setPaintProperty(neighbourhood.id, 'fill-opacity', 0.6);
      map.current.setPaintProperty(neighbourhood.id + '-line', 'line-width', 0);
    });

    isNeighbourhoodClickedRef.current = false; // allow for on hover effects to be resumed

  }

  const changeColourScheme = () => {
    setColourPairIndex(prevIndex => {
      const newIndex = (prevIndex + 1) % colourPairs.length;
      handleChangeColours(newIndex);
      return newIndex;
    });
  }

  const handleChangeColours = (colourPairIndex) => {

    // Create a new colourScale each time you handle the color change
    const colourScale = scaleLinear().domain([0, 0.4, 0.8]).range(colourPairs[colourPairIndex]);
  
    if (!map.current || !busynessHashMap) return; // Added a check for busynessMap
  
    // Get the current map's style
    const style = map.current.getStyle();
  
    neighbourhoods.features.forEach(neighbourhood => {
      // Check if the layer exists in the style before trying to update it
      if (style.layers.some(layer => layer.id === neighbourhood.id)) {
        const score = busynessHashMap[neighbourhood.id];
        if (score !== undefined) { // Check if the score is defined before using it
          const newColour = colourScale(score);
          map.current.setPaintProperty(neighbourhood.id, 'fill-color', newColour);
        }
        else {
          console.warn(`Current layer does not have a score`);
        }
      } else {
        console.warn(`Layer with ID ${neighbourhood.id} doesn't exist`);
      }
    })
  }

  // Map Event Listeners for mouse
  const initialiseMouseMapEvents = (map) => {

    // Create a new colourScale each time you handle the color change
    const colourScale = scaleLinear().domain([0, 0.4, 0.8]).range(colourPairs[colourPairIndex]);

    neighbourhoods.features.forEach((neighbourhood) => {

      // Mouseover event
      map.on('mousemove', neighbourhood.id, (e) => {
        
          if (!isNeighbourhoodClickedRef.current) {

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
                  
                  // Apply the busyness score to the color scale
                  const textColour = colourScale(neighbourhood.busyness_score);

                  let richText;
                  if (neighbourhood.busyness_score < 0.29) {
                      richText = 'Not Very Busy';
                  } else if (neighbourhood.busyness_score >= 0.29 && neighbourhood.busyness_score < 0.4) {
                      richText = 'Relatively Busy';
                  } else if (neighbourhood.busyness_score >= 0.4 && neighbourhood.busyness_score < 0.7) {
                      richText = 'Busy';
                  } else {
                      richText = 'Extremely Busy';
                  }

                  // Set the HTML content of the popup with the colored text
                  popup.current.setLngLat(e.lngLat).setHTML(`${zone}: <span style="color: ${textColour}">${richText} - ${Math.floor(neighbourhood.busyness_score * 100)}</span>`).addTo(map);
                }
          }
      });
  
      // Mouseleave event: this will be fired whenever the mouse leaves a feature in the specified layer.
      map.on('mouseleave', neighbourhood.id, () => {
        if (!isNeighbourhoodClickedRef.current) {
            map.getCanvas().style.cursor = '';
            map.setPaintProperty(neighbourhood.id, 'fill-opacity', 0.6);
            map.setPaintProperty(neighbourhood.id+'-line', 'line-width', 0);

            if (popup.current) {
                popup.current.remove();
                popup.current = null;
            }
          }
      });

      map.on('click', (e) => {

        popup.current?.remove();

        const features = map.queryRenderedFeatures(e.point);

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
          map.flyTo({ center: [lng, lat], zoom: 15, essential: true });

          map.setPaintProperty(firstFeature.id, 'fill-opacity', 0);

          const zone = firstFeature.properties.zone;

          setZoneID(firstFeature.id)

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
 
  // Fetch Request for Busyness Prediction 
  const getPredictionBusyness = (Event_ID) => {

    // write fetch request here to get scores from api/prediction
    // this should be handled in a use effect with a dependency for a prediction

    const formattedDate = new Date().toISOString().slice(0,10);

    console.log('this is the EID being passed in', Event_ID)

    // we are going to use date + ID as the argument
    // fetch((`${BASE_API_URL}/predict/${formattedDate}/${Event_ID}`))
    fetch((`${BASE_API_URL}/predict/${formattedDate}`))
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => setScores(data))
    .catch((error) => {
      console.error('Issue with fetch request for prediction:', error);
      setError(error)
    });

  };

  const visualiseEventImpact = (Event_ID) => {

    setNeighbourhoodEvents([]);

    isNeighbourhoodClickedRef.current = false; // user has reset the select function so we reset the map to default state.
  
    neighbourhoods.features.forEach((neighbourhood) => {
      map.current.setPaintProperty(neighbourhood.id, 'fill-opacity', 0.6);
      map.current.setPaintProperty(neighbourhood.id + '-line', 'line-width', 0);
    });
  
    map.current.flyTo({zoom: 12, essential: true, center: [originalLng, originalLat] });

    setTimeout(() => {
      getPredictionBusyness(Event_ID);
    }, 900)
  
  }

  const highlightEventImpact = (Zone_ID, labels) => {
  
    isNeighbourhoodClickedRef.current = true; // disable on hover and write replacement code below for on highlight impact
  
    neighbourhoods.features.forEach((neighbourhood) => {
            
      let opacity = labels.includes(neighbourhood.id) ? 0.7 : 0.1;
      let line = labels.includes(neighbourhood.id) ? 1 : 0;
      map.current.setPaintProperty(neighbourhood.id, 'fill-opacity', opacity);
      map.current.setPaintProperty(neighbourhood.id + '-line', 'line-width', line);

      console.log(neighbourhood)

      if (neighbourhood.id == Zone_ID){

        let isHighlighted = false;

        const intervalId = setInterval(() => {
          isHighlighted = !isHighlighted;
          
          map.current.setPaintProperty(Zone_ID, 'fill-opacity', isHighlighted ? 0.9 : 0.3);

        }, 500);
      }
  
      if (labels.includes(neighbourhood.id)) {

        map.current.off('mousemove', neighbourhood.id);
        map.current.off('mouseleave', neighbourhood.id);
  
        map.current.on('mousemove', neighbourhood.id, (e) => {
  
          map.current.getCanvas().style.cursor = 'pointer';
          map.current.setPaintProperty(neighbourhood.id, 'fill-opacity', 0.9);
          map.current.setPaintProperty(neighbourhood.id + '-line', 'line-width', 4);
  
          const features = map.current.queryRenderedFeatures(e.point, { layers: [neighbourhood.id] });
  
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
  
            popup.current.setLngLat(e.lngLat).setHTML(`${zone}, ${neighbourhood.id}`).addTo(map.current);
          }
        }); // close the mousemove event block
  
        map.current.on('mouseleave', neighbourhood.id, () => {
          if (labels.includes(neighbourhood.id)) {
            map.current.getCanvas().style.cursor = '';
            map.current.setPaintProperty(neighbourhood.id, 'fill-opacity', opacity);
            map.current.setPaintProperty(neighbourhood.id + '-line', 'line-width', line);
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

  useEffect(() => {

    const fetchScores = async () => {
  
      const formattedDate = new Date().toISOString().slice(0,10);
      
      try {
        const response = await fetch(`${BASE_API_URL}/baseline/${formattedDate}`);
        if (!response.ok) { throw new Error('Network response was not ok'); }
        const data = await response.json();
        console.log(data);
        setScores(data);
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
        pitch: pitch
      });

      map.current.on('load', () => {
        map.current.flyTo({zoom: 12, essential: true, center: [originalLng, originalLat] });
        renderNeighbourhoods(map.current);
        add3DBuildings(map.current);
        renderEvents(map.current);
        initialiseMouseMapEvents(map.current);
        setTimeout(() => {
          updateLayerColours(map.current, false, originalBusynessHashMap, busynessHashMap)
        }, 800);
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
        updateLayerColours(map.current, false, originalBusynessHashMap, busynessHashMap)
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

  return (

    <div>
        
        <div ref={mapContainer} style={{ width: '100%', height: '100vh' }}>

        {isSplitView ? (
            <SplitViewMap 
            originalBusynessHashMap={originalBusynessHashMap}
            busynessHashMap={busynessHashMap}
            initialiseMouseMapEvents={initialiseMouseMapEvents}
            />
        ) : (
          <>

          <Navbar />

          <FloatingNav 
            map={map}
            disableColours = {disableColours}
            isNeighbourhoodClickedRef = {isNeighbourhoodClickedRef}
            changeColourScheme={changeColourScheme}
            enableColours={enableColours}
            />

          <FloatingInfoBox
            map={map}
            visualiseEventImpact={visualiseEventImpact}
            highlightEventImpact={highlightEventImpact}
            resetColours={resetColours}
            originalBusynessHashMap={originalBusynessHashMap}
            busynessHashMap={busynessHashMap}
            hashMapOfDifference={hashMapOfDifference}
            colours={colourPairs[colourPairIndex]}
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
