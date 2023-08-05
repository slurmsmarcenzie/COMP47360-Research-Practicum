import React, { createContext, useContext, useState, useMemo} from 'react';
import { scaleLinear } from 'd3-scale';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import FontawesomeMarkers from "mapbox-gl-fontawesome-markers";
import '@fortawesome/fontawesome-free/css/all.css';

// Data
import neighbourhoods from '../geodata/nyc-taxi-zone.geo.json';
import prunedEvents from '../geodata/prunedEvents.json'

// Create a new context
const MapContext = createContext();

const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoiaGFycnlvY2xlaXJpZ2giLCJhIjoiY2xpdzJmMzNjMWV2NDNubzd4NTBtOThzZyJ9.m_TBrBXxkO0y0GjEci199g';
const BASE_API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/app/v1';
let animationID = null;

// Create a provider component
export const MapProvider = ({ children }) => {

    const [markers, setMarkers] = useState([]);
    const [colourPairIndex, setColourPairIndex] = useState(0);
    const [neighbourhoodEvents, setNeighbourhoodEvents] = useState([]);
    const [eventsMap, setEventsMap] = useState([]);
    const [zone, setZone] = useState(null);
    const [error, setError] = useState(null);
    const [isSplitView, setSplitView] = useState(false);
    const [useOriginal, setUseOriginal] = useState(false); // this determines which hashmap we want to use the original baseline or the dynamic map?
    const [makePredictionRequest, setMakePredictionRequest] = useState(false);
    const [eventForAnalysisComponent, setEventForAnalysisComponent] = useState(null);
    const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/dark-v11'); // default to dark mode
    const [isResetShowing, setIsResetShowing] = useState(false)
    const [lastMarkers, setLastMarkers] = useState([]);
    const [isNavVisible, setIsNavVisible] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(true);
    const [isThereALiveInfoBox, setIsThereALiveInfoBox] = useState(false);
    const [isMobileTileOpen, setIsMobileTileOpen] = useState(false); 
    const [isFloatingNavVisible, setIsFloatingNavVisible] = useState(true);
    const [isTimelapseVisible, setIsTimelapseVisible] = useState(false);
    const [eventComparisonData, setEventComparisonData] = useState(null);
    const [eventID, setEventID] = useState(null);

    const [showInfoBox, setShowInfoBox] = useState(false); // sets the infobox state to true if we want to see if
    const [showNeighborhoodInfoBox, setShowNeighborhoodInfoBox] = useState(false); // sets sub-component of infobox, which basically handles whether or not to show that there are no events in an area
    const [showChart, setShowChart] = useState(true);  // This boolean state controls the visibility of the chart. If it's true, the chart is displayed; if false, the chart is hidden.
    const [showChartData, setShowChartData] = useState(false); // determines the data being used when setShowChart has been set to true
    const [showMatchingEvent, setShowMatchingEvent] = useState(true);

    // zone and event setters used in floating info box and elsewhere
    const [zoneID, setZoneID] = useState(null);
    const [eventName, setEventName] = useState(null);  

    const originalLat = 40.7484;
    const originalLng = -73.9857;
    const zoom = 7;
    const pitch = 30;
    const boundary = [
        [-74.255591, 40.477388],
        [-73.698697, 40.983697]
    ]

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
        return scaleLinear().domain([0, 0.4, 0.8]).range(colourPairs[colourPairIndex]);
    }, [colourPairs, colourPairIndex]);
    
    const add3DBuildings = (map) => {

        map.addLayer({
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

    const renderNeighbourhoods = (map) => {

        // loop over the neighborhoods and create a new layer for each
        neighbourhoods.features.forEach((neighbourhood) => {

            // construct the layer ID
            const layerId = `${neighbourhood.properties.location_id}`;

            // add new properties to our neighbourhood objects so that we can reuse them later (on hover effect)
            neighbourhood.id = layerId;

            // add new line id to our neighbourhood objects so that we can reuse them later (on hover effect)
            const lineLayerId = layerId + '-line';

            // add two distinct layer types:
            // 1. Fill layer -> we will use this to colour in our boundaries
            // 2. Line layer -> we will use this layer to highlight the borders of our boundaries on hover
            
            if (!map.getLayer(layerId)) {
            map.addLayer({
                id: neighbourhood.id,
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

            if (!map.getLayer(lineLayerId)) {

            map.addLayer({
                id: neighbourhood.id+'-line',
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

    const renderEvents = (map) => {

        const newMarkers = []; // array to hold our new markers

        prunedEvents.forEach((event, index) =>{

            const scale = 1.2

            // marker styling
            const icons = [
                'fa-solid fa-dove',
                'fa-solid fa-ghost',
                'fa-solid fa-clover',
                'fa-solid fa-rainbow',
                'fa-solid fa-champagne-glasses',
                'fa-solid fa-moon',
                'fa-solid fa-crown',
                'fa-solid fa-burst'
            ]

            const icon = icons[index % icons.length];  // Rotate through the icons array

            const marker = new FontawesomeMarkers({
                icon,
                iconColor: 'white',
                color: 'blueviolet',
                scale
            })
            .setLngLat([event.Event_Location.Longitude, event.Event_Location.Latitude]).addTo(map);
            
            const markerElement = marker.getElement();

            // add our event id to our markers so that we can show/hide them based on their event ID value
            marker.Event_ID = event.Event_ID;

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

    const showAllMarkers = (map) => {
        
        const newMarkers = []; // array to hold our new markers
    
        prunedEvents.forEach((event, index) => {
            const exists = markers.some(marker => 
                marker.getLngLat().lng === event.Event_Location.Longitude && 
                marker.getLngLat().lat === event.Event_Location.Latitude
            );

            if (!exists) {

                const scale = 1.2

                // marker styling
                const icons = [
                    'fa-solid fa-dove',
                    'fa-solid fa-ghost',
                    'fa-solid fa-clover',
                    'fa-solid fa-rainbow',
                    'fa-solid fa-champagne-glasses',
                    'fa-solid fa-moon',
                    'fa-solid fa-crown',
                    'fa-solid fa-burst'
                ]
    
                const icon = icons[index % icons.length];  // Rotate through the icons array
   
                const marker = new FontawesomeMarkers({
                    icon,
                    iconColor: 'white',
                    color: 'blueviolet',
                    scale
                })
                .setLngLat([event.Event_Location.Longitude, event.Event_Location.Latitude]).addTo(map);

                marker.Event_ID = event.Event_ID;

                newMarkers.push(marker);
            }
        });
    
        setMarkers(prevMarkers => [...prevMarkers, ...newMarkers]); // Update the state 
        
    };
    
    const removeAllMarkers = () => {

        markers.forEach((marker) => {
            marker.remove(); // Remove the marker from the map
        });
    
        // setMarkers([]); // Clear the markers array
    };
    
    const removeAllButOneMarker = (keptEvent) => {

        markers.forEach((marker) => {

            if (marker.Event_ID !== keptEvent) {
                marker.remove();
            }

            if(marker.Event_ID == keptEvent){
                console.log('this is the matching marker', marker)
            }
        });
        
        setMarkers(markers.filter(marker => marker.Event_ID == keptEvent))
  
    };

    // Function to update the color of each layer in a map, based on a 'busyness' score
    const updateLayerColours = (map, isOriginalHashMap, originalBusynessHashMap, busynessHashMap) => {
  
        // If the map, busynessHashMap, or neighbourhoods are not defined, end the function
        if (!map|| !busynessHashMap || !neighbourhoods) return; 

        // Get the current style object from the map
        const style = map.getStyle();
      
        // Iterate over each neighbourhood in the 'neighbourhoods' array
        neighbourhoods.features.forEach(neighbourhood => {

            // Check if a layer with the current neighbourhood's id exists in the map's style
            if (style.layers.some(layer => layer.id === neighbourhood.id)) {

                // Based on the 'isOriginalHashMap' flag, select the appropriate 'busyness' score
                const score = isOriginalHashMap ? originalBusynessHashMap[neighbourhood.id] : busynessHashMap[neighbourhood.id];

                // Assign this score to the 'busyness_score' property of the neighbourhood
                neighbourhood.busyness_score = score;

                // If the score is defined, use it to calculate a new color and set the 'fill-color' property of the neighbourhood's layer
                if (score !== undefined) {
                    const newColour = colourScale(score);
                    map.setPaintProperty(neighbourhood.id, 'fill-color', newColour);
                }
            } else {
                // If a layer with the current neighbourhood's id does not exist in the map's style, log a warning to the console
                console.warn(`Layer with ID ${neighbourhood.id} doesn't exist`);
            }
        });
    };

    const addAntline = (map, event) => {

        console.log('event inside the antline', event);

        const colourMap = {
            1: ['#FFFFFF', '#000000'],
            2: ['#FFFFFF', '#000000'],
            3: ['#FFFFFF', '#000000'],
            4: ['#FFFFFF', '#000000'],
            5: ['#FFFFFF', '#000000'],
            6: ['#FFFFFF', '#000000'],
            7: ['#FFFFFF', '#000000'],
            8: ['#FFFFFF', '#000000']
        };

        map.addSource('line', {
            type: 'geojson',
            data: event
        });

        map.addLayer({
                type: 'line',
                source: 'line',
                id: 'line-background',
                paint: {
                'line-color': colourMap[event.properties.event_id][0],
                'line-width': 6,
                'line-opacity': 0.4
                }
            });

            // add a line layer with line-dasharray set to the first value in dashArraySequence
            map.addLayer({
                type: 'line',
                source: 'line',
                id: 'line-dashed',
                paint: {
                'line-color': colourMap[event.properties.event_id][1],
                'line-width': 6,
                'line-dasharray': [0, 4, 3]
                }
            });
             
            // technique based on https://jsfiddle.net/2mws8y3q/
            // an array of valid line-dasharray values, specifying the lengths of the alternating dashes and gaps that form the dash pattern
            const dashArraySequence = [
                [0, 4, 3],
                [0.5, 4, 2.5],
                [1, 4, 2],
                [1.5, 4, 1.5],
                [2, 4, 1],
                [2.5, 4, 0.5],
                [3, 4, 0],
                [0, 0.5, 3, 3.5],
                [0, 1, 3, 3],
                [0, 1.5, 3, 2.5],
                [0, 2, 3, 2],
                [0, 2.5, 3, 1.5],
                [0, 3, 3, 1],
                [0, 3.5, 3, 0.5]
            ];
             
            let step = 0;
             
            function animateDashArray(timestamp) {
            // Update line-dasharray using the next value in dashArraySequence. The
            // divisor in the expression `timestamp / 50` controls the animation speed.
                const newStep = parseInt(
                    (timestamp / 50) % dashArraySequence.length
            );
             
            if (newStep !== step) {
                map.setPaintProperty(
                'line-dashed',
                'line-dasharray',
                dashArraySequence[step]
              );
                step = newStep;
            }
             
                // Request the next frame of the animation.
                animationID = requestAnimationFrame(animateDashArray);
            }
            
            const icon = 'fa-solid fa-person-walking'
            // trying to add a mini marker along the parade line
            const marker = new FontawesomeMarkers({
                icon,
                iconColor: 'white',
                color: 'orange',
            })
            .setLngLat(event.geometry.coordinates[0])
            .addTo(map);

            // Get the coordinates of the line
            const coordinates = event.geometry.coordinates;

            // Calculate the total number of steps
            const numSteps = coordinates.length - 1;

            // Initialize a variable for the current step
            let currentStep = 0;

            let animationFrameId = null;

            // Function to move the marker
            const moveMarker = () => {
                // Only move the marker if we haven't reached the end of the line
                if (currentStep <= numSteps) {
                    // Get the current coordinate
                    const currentCoordinate = coordinates[currentStep];
            
                    // Move the marker to the current coordinate
                    marker.setLngLat(currentCoordinate);
            
                    // Increment the step
                    currentStep++;
                }
            
                // Continue the animation if we haven't reached the end of the line
                if (currentStep <= numSteps) {
                    // Add a delay before the next frame
                    setTimeout(() => {
                        requestAnimationFrame(moveMarker);
                    }, 1000); // delay in milliseconds
                }

                if (currentStep > numSteps){
                    marker.remove();
                }
            };

            moveMarker();

            // start the animation
            animateDashArray(0);
    }

    const removeAntline = (map) => {
        
        if (map.getLayer('line-background')){
            map.removeLayer('line-background');
            map.removeLayer('line-dashed');
            map.removeSource('line');
        }

        if(animationID){
            cancelAnimationFrame(animationID);
            animationID = null;
        }
    };

    const addMarker = (map, coordinates) => {

        const icon = 'fa-solid fa-flag-checkered'
        const scale = 1.2

        const marker = new FontawesomeMarkers({
            icon,
            iconColor: 'white',
            color: 'red',
            scale
        }).setLngLat(coordinates).addTo(map);
        lastMarkers.push(marker);
    };

    const removeMarker = () => {
        lastMarkers.forEach((marker) => {
            marker.remove(); // Remove each marker from the map
          });
          setLastMarkers([]);
    };

    const removeAllLines = (map) => {

        neighbourhoods.features.forEach((neighbourhood) => {
            map.setPaintProperty(neighbourhood.id + '-line', 'line-width', 0);
        });
    }

  return (
    <MapContext.Provider
      value={{

        MAPBOX_ACCESS_TOKEN,
        BASE_API_URL,

        add3DBuildings,
        renderNeighbourhoods,
        renderEvents,
        updateLayerColours,
        removeAllMarkers,
        showAllMarkers,
        removeAllButOneMarker,
        addAntline,
        removeAntline,
        removeMarker,
        addMarker,
        removeAllLines,

        colourPairIndex, setColourPairIndex,
        neighbourhoodEvents, setNeighbourhoodEvents,
        eventsMap, setEventsMap,
        zone, setZone,
        error, setError,
        isSplitView, setSplitView,
        showInfoBox, setShowInfoBox,
        showNeighborhoodInfoBox, setShowNeighborhoodInfoBox,
        showChart, setShowChart,
        showChartData, setShowChartData,
        useOriginal, setUseOriginal,
        makePredictionRequest, setMakePredictionRequest,
        zoneID, setZoneID,
        eventName, setEventName,
        eventForAnalysisComponent, setEventForAnalysisComponent,
        mapStyle, setMapStyle,
        isResetShowing, setIsResetShowing,
        showMatchingEvent, setShowMatchingEvent,
        isNavVisible, setIsNavVisible,
        isDrawerOpen, setIsDrawerOpen,
        isThereALiveInfoBox, setIsThereALiveInfoBox,
        isMobileTileOpen, setIsMobileTileOpen,
        isFloatingNavVisible, setIsFloatingNavVisible,
        isTimelapseVisible, setIsTimelapseVisible,
        eventComparisonData, setEventComparisonData,
        eventID, setEventID,
        
        neighbourhoods,
        prunedEvents,
        colourPairs,
        colourScale,

        originalLat,
        originalLng,
        zoom,
        pitch,
        boundary
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

// Custom hook to use the MapContext
export const useMapContext = () => {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error('useMapContext must be used within a MapProvider');
  }
  return context;
};