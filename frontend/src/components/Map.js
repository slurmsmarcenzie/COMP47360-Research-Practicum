// Core dependencies of App
import React, { useEffect, useRef,useState, useMemo, lazy, Suspense } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { scaleLinear } from 'd3-scale';
import throttle from 'lodash/throttle';

// Context builder
import { useMapContext } from './MapContext';

// Components
import FloatingNav from './FloatingNav';
import Navbar from './Navbar';
import MapLegend from './MapLegend';
import Timelapse from './Timelapse';
import { faL } from '@fortawesome/free-solid-svg-icons';

const FloatingInfoBox = lazy(() => import('./FloatingInfoBox'));
const SplitViewMap = lazy(() => import('./SplitViewMap'));

// Note: the following lines are important to create a production build that includes mapbox
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;

function Map() {

  // foundations
  const {MAPBOX_ACCESS_TOKEN, BASE_API_URL} = useMapContext();

  // imported base functions
  const { add3DBuildings, renderNeighbourhoods, updateLayerColours, renderEvents, showAllMarkers} = useMapContext();

  // add arrays
  const {neighbourhoods, prunedEvents} = useMapContext();

  const [timelapseData, setTimelapseData] = useState(null);
  const [baselineTimelapseData, setBaselineTimelapseData] = useState(null)

  // import base states
  const { colourPairIndex, setColourPairIndex, colourPairs, setNeighbourhoodEvents, eventsMap, setZone, setError, isSplitView, isFloatingNavVisible, setIsFloatingNavVisible} = useMapContext();
  
  // states to conditional render components
  const {setShowInfoBox, setShowNeighborhoodInfoBox, setShowChart, setShowChartData, setZoneID, setIsResetShowing, isTimelapseVisible, setIsTimelapseVisible, eventComparisonData, setEventComparisonData} = useMapContext();

  // magic numbers
  const { originalLat, originalLng, zoom, pitch, boundary } = useMapContext();

  const {eventID, setEventID} = useMapContext();

  // swapping styles
  const {mapStyle} = useMapContext();

  // map specific states
  const [scores, setScores] = useState(null);
  const [originalBusynessHashMap, setOriginalBusynessHashMap] = useState(null);
  const [eventBaselineScores, setEventBaselineScores] = useState(null);
  const [hashMapOfDifference, setHashMapOfDifference] = useState(null);
  const [hoveredZoneScore, setHoveredZoneScore] = useState(null);
  const [showNoEventInfobox, setShowNoEventInfobox] = useState(true)
  const [eventSelected, setEventSelected] = useState(false);
  

  // objects for our map
  const mapContainer = useRef(null);
  const map = useRef(null);
  const isNeighbourhoodClickedRef = useRef(false);
  
  // flimsy counter replace later
  const retryCount = useRef(0);

  // Pop up properties  
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

  // Instantiate popup once and reuse it
  const popup = useRef(new mapboxgl.Popup({
    offset: popupOffsets,
    closeButton: false,
    closeOnClick: false,
  }));
  
  // Change of Colour Handling
  const enableColours = () => {

    setIsResetShowing(false);
    setShowInfoBox(false);
    setShowNeighborhoodInfoBox(false);
    setShowChartData(false);
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

    neighbourhoods.features.forEach((neighbourhood) => {
      // Mouseover event
      map.on('mousemove', neighbourhood.id, (e) => handleMouseMove(neighbourhood, map, e));
    
      // Mouseleave event
      map.on('mouseleave', neighbourhood.id, () => handleMouseLeave(neighbourhood, map));

    });

    // On click event
    map.on('click', (e) => handleClick(map, e));
    
  };

  // Define the mousemove handler outside of the initialiseMouseMapEvents function
  const handleMouseMove = throttle((neighbourhood, map, e) => {

    // Create a new colourScale outside the loop
    const colourScale = scaleLinear().domain([0, 0.4, 0.8]).range(colourPairs[colourPairIndex]);

    if (!isNeighbourhoodClickedRef.current) {

      map.getCanvas().style.cursor = 'pointer';
      map.setPaintProperty(neighbourhood.id, 'fill-opacity', 0.9);
      map.setPaintProperty(neighbourhood.id+'-line', 'line-width', 4);
      
      const features = map.queryRenderedFeatures(e.point, { layers: [neighbourhood.id] });

      if (features.length > 0) {

          if (!popup.current) {

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
          setHoveredZoneScore(neighbourhood.busyness_score);

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

          const matchingEvent = prunedEvents.find(event => event.Zone_ID === feature.id);
          const eventInfo = matchingEvent && !isNeighbourhoodClickedRef.current
            ? `Upcoming event: ${matchingEvent.Event_Name}`
            : '';
                    
          // Set the HTML content of the popup with the colored text
          popup.current.setLngLat(e.lngLat)
          .setHTML(`${zone} is <span style="color: ${textColour}">${richText}</span>
          <br>
          Busyness Score:  <span style="color: ${textColour}">${Math.floor(neighbourhood.busyness_score * 100)}</span>
          <br>
          ${eventInfo}
          `)
          .addTo(map);
        }
      }  
  }, 5); // The function will not execute more than once every 200ms
  
  const handleMouseLeave = (neighbourhood, map) => {
    if (!isNeighbourhoodClickedRef.current) {
      map.getCanvas().style.cursor = '';
      map.setPaintProperty(neighbourhood.id, 'fill-opacity', 0.6);
      map.setPaintProperty(neighbourhood.id+'-line', 'line-width', 0);

      if (popup.current) {
        popup.current.remove();
        popup.current = null;
      }
    }
  };

   const handleClick = (map, e) => {

    isNeighbourhoodClickedRef.current = false;

    popup.current?.remove();

    const features = map.queryRenderedFeatures(e.point);

    if (features.length > 0 && features[0].id !== undefined) {

      neighbourhoods.features.forEach(neighbourhood =>{
        map.setPaintProperty(neighbourhood.id+'-line', 'line-width', 0);
      });

      const [firstFeature] = features;

      const zone = firstFeature.properties.zone;

      setZoneID(firstFeature.id);

      // check to see if a map belongs in our hashmap of events or otherwise filter by events that match the location id on each event by the current id of our zone
      const matchingEvents = eventsMap[firstFeature.id] || prunedEvents.filter(event => event.Zone_ID === firstFeature.id);

      setNeighbourhoodEvents(matchingEvents);

      if (matchingEvents.length > 0) {
        setShowInfoBox(true);
        setShowNeighborhoodInfoBox(false);
        isNeighbourhoodClickedRef.current = true;
        map.setPaintProperty(firstFeature.id+'-line', 'line-width', 4);
      } 
      
      if (matchingEvents.length == 0) {
        // Show the neighborhood info box since there are no matching events
        setShowNeighborhoodInfoBox(true);
      }

      setZone(zone);
      setIsResetShowing(true)
    }
  };

  // Fetch Request for Historic Busyness
  const getHistoricBusyness = async (Event_ID) => {
  
    try {
      const impactResponse = await fetch(`${BASE_API_URL}/historic/${Event_ID}/impact`);
      if (!impactResponse.ok) {
        throw new Error('Network response was not ok');
      }
      const impactData = await impactResponse.json();
      setScores(impactData);
    } catch (error) {
      console.error('Issue with fetch request for event impact:', error);
      setError(error);
    }
  
    try {
      const baselineResponse = await fetch(`${BASE_API_URL}/historic/${Event_ID}/baseline`);
      if (!baselineResponse.ok) {
        throw new Error('Network response was not ok');
      }
      const baselineData = await baselineResponse.json();
      setEventBaselineScores(baselineData);
    } catch (error) {
      console.error('Issue with fetch request for event baseline:', error);
      setError(error);
    }
  };

  const visualiseEventImpact = (Event_ID) => {

    setEventSelected(true);
    setShowChart(false);
    setShowNoEventInfobox(false);
    setShowNeighborhoodInfoBox(false);
    setNeighbourhoodEvents([]);
    setIsFloatingNavVisible(false);
    setIsTimelapseVisible(false);

    isNeighbourhoodClickedRef.current = false; // user has reset the select function so we reset the map to default state.
  
    neighbourhoods.features.forEach((neighbourhood) => {
      map.current.setPaintProperty(neighbourhood.id, 'fill-opacity', 0.6);
      map.current.setPaintProperty(neighbourhood.id + '-line', 'line-width', 0);
    });
    
    map.current.flyTo({zoom: 11.2, essential: true, center: [-73.92769581823755, 40.768749153384405]}); 

    getHistoricBusyness(Event_ID);
    setEventID(Event_ID);
    fetchEventComparison(Event_ID);
    setTimeout(() => fetchTimelapse(Event_ID), 600)
    fetchBaslineTimelapse(Event_ID)
  }

  const highlightEventImpact = (impactedZones) => {

    isNeighbourhoodClickedRef.current = true;
  
    const setNeighbourhoodProperties = (neighbourhoodId, opacity, lineWidth) => {
      map.current.setPaintProperty(neighbourhoodId, 'fill-opacity', opacity);
      map.current.setPaintProperty(neighbourhoodId + '-line', 'line-width', lineWidth);
    };
   
    neighbourhoods.features.forEach((neighbourhood) => {
      const isLabelPresent = impactedZones.includes(neighbourhood.id);
      let opacity = isLabelPresent ? 0.7 : 0.1;
      let line = isLabelPresent ? 1 : 0;
  
      setNeighbourhoodProperties(neighbourhood.id, opacity, line);
  
    });

  };
  
  // Define an effect that will run every time 'scores' or 'eventBaselineScores' changes
  useEffect(() => {
    // If 'scores' and 'eventBaselineScores' have been fetched
    if (scores && eventBaselineScores) {
      // Start a timeout that will delay the execution of the next function
      const timeoutId = setTimeout(() => {
        // After a delay of 2000 ms, update the colors of the layers on the map
        updateLayerColours(map.current, false, eventBaselineHashMap, busynessHashMap);
      }, 700); // Delay of 2000 ms

      // Return a cleanup function that will run when the component unmounts, or before this effect runs again
      return () => {
        // If the component unmounts before the timeout finishes, cancel the timeout to prevent a potential memory leak
        clearTimeout(timeoutId);
      }
    }
  }, [scores, eventBaselineScores]); // Dependencies of this effect: 'scores' and 'eventBaselineScores'

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
    return {...scores}    
  }, [scores]);  // The array of dependencies for 'useMemo'. 'busynessMap' will be recomputed whenever 'scores' changes

  // same implementation as above
  const eventBaselineHashMap = useMemo(() => {
    if (!eventBaselineScores) return {};  
    return {...eventBaselineScores}
  }, [eventBaselineScores]);  

  useEffect(() => {

    const fetchScores = async () => {
      
      try {
        const response = await fetch(`${BASE_API_URL}/prediction/current`);
        if (!response.ok) { throw new Error('Network response was not ok'); }
        const data = await response.json();
        setScores(data);
      } 
      
      catch (err) {
        if (retryCount.current < 3) {
          retryCount.current++;
          setTimeout(() => {fetchScores()}, 3000);
        } else {
          setError('Failed to fetch scores after three attempts');
          setScores([])
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

    if (!map.current) {
      if (!scores) {
        return; // Exit early if scores are not available
      }
  
      mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
  
      const initialiseMap = () => {
        map.current.flyTo({zoom: 12, essential: true, center: [originalLng, originalLat] });
        renderNeighbourhoods(map.current);
        add3DBuildings(map.current);
        renderEvents(map.current);
        initialiseMouseMapEvents(map.current);
        updateLayerColours(map.current, false, originalBusynessHashMap, busynessHashMap)
      }
  
      if (!map.current) {
        // Initialize map
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: mapStyle,
          center: [originalLng, originalLat],
          zoom: zoom,
          pitch: pitch,
          maxBounds: boundary
        });
  
        map.current.on('load', initialiseMap);

      } 
    }
  }, [scores]); // This effect runs when scores is fetched
    
  // Separate useEffect for handling mapStyle changes
  useEffect(() => {
    if (map.current) {
      // Change the style
      map.current.setStyle(mapStyle);

      // Only fly to the location and update colours on style load
      map.current.once('style.load', () => {
        map.current.flyTo({zoom: 12, essential: true, center: [originalLng, originalLat] });
        
        renderNeighbourhoods(map.current);
        add3DBuildings(map.current);

        setTimeout(() => {
          
          updateLayerColours(map.current, false, originalBusynessHashMap, busynessHashMap)
        }, 900);
      });
    }
  }, [mapStyle]); // This effect runs when mapStyle changes

  const fetchEventComparison = async (Event_ID) => {
  
    try {
     const eventComparisonResponse = await fetch(`${BASE_API_URL}/historic/${Event_ID}/comparison`);
     if (!eventComparisonResponse) {
      throw new Error('Network response was not ok');
     }
     const eventComparisonData = await eventComparisonResponse.json();
     setEventComparisonData(eventComparisonData);
    } catch (error) {
     console.error('Issue with fetch request for event impact:', error);
     setError(error);
    }
  }

  const fetchTimelapse = async (Event_ID) => {

    try {
      const timelapseResponse = await fetch(`${BASE_API_URL}/historic/${Event_ID}/timelapse/impact`);
      if (!timelapseResponse) {
       throw new Error('Network response was not ok');
      }
      const timelapseData = await timelapseResponse.json();
      setTimelapseData(timelapseData);
     } catch (error) {
      console.error('Issue with fetch request for timelapse function:', error);
      setError(error);
     }
  }

  const fetchBaslineTimelapse = async (Event_ID) => {

    try {
      const baselineTimelapseResponse = await fetch(`${BASE_API_URL}/historic/${Event_ID}/timelapse/baseline`);
      if (!baselineTimelapseResponse) {
       throw new Error('Network response was not ok');
      }
      const baselineTimelapseData = await baselineTimelapseResponse.json();
      setBaselineTimelapseData(baselineTimelapseData);
     } catch (error) {
      console.error('Issue with fetch request for timelapse function:', error);
      setError(error);
     }
  }

  return (

    <div>
        
        <div ref={mapContainer} style={{ width: '100%', height: '100vh' }}>

        {isSplitView ? (
          <Suspense fallback={<div>Loading SplitViewMap...</div>}>
            <SplitViewMap 
              baselineTimelapseData={baselineTimelapseData}
              timelapseData={timelapseData}
              eventBaselineHashMap={eventBaselineHashMap}
              originalBusynessHashMap={originalBusynessHashMap}
              busynessHashMap={busynessHashMap}
              initialiseMouseMapEvents={initialiseMouseMapEvents}
            />
          </Suspense>
        ) : (
          <>

          <Navbar />

          {isFloatingNavVisible ? (
            <FloatingNav 
              map={map}
              disableColours = {disableColours}
              isNeighbourhoodClickedRef = {isNeighbourhoodClickedRef}
              changeColourScheme={changeColourScheme}
              enableColours={enableColours}
              />
            ): <></>}

          <FloatingInfoBox
            map={map}
            eventSelected={eventSelected}
            setEventSelected={setEventSelected}
            showNoEventInfobox={showNoEventInfobox}
            setShowNoEventInfobox={setShowNoEventInfobox}
            isNeighbourhoodClickedRef={isNeighbourhoodClickedRef}
            updateLayerColours={updateLayerColours}
            visualiseEventImpact={visualiseEventImpact}
            highlightEventImpact={highlightEventImpact}
            resetColours={resetColours}
            originalBusynessHashMap={originalBusynessHashMap}
            eventBaselineHashMap={eventBaselineHashMap}
            busynessHashMap={busynessHashMap}
            hashMapOfDifference={hashMapOfDifference}
            colours={colourPairs[colourPairIndex]}
            />

          <MapLegend
            colours={colourPairs[colourPairIndex]} 
            hoveredZoneScore={hoveredZoneScore}
          />

          {isTimelapseVisible ?
            <Timelapse
              map={map}
              originalBusynessHashMap={originalBusynessHashMap}
              busynessHashMap={busynessHashMap}
              timelapseData={timelapseData}
            /> : <></>
          }

          </>
        )}
      </div>

    </div>

  );
};

export default Map;