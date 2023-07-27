import React, {useState, useRef, useEffect} from 'react';
import scores from '../geodata/output.json'
import "../App.css";
import { useMapContext } from './MapContext';

function Timelapse ({map, originalBusynessHashMap, timelapseData, busynessHashMap}) {

    const {updateLayerColours} = useMapContext();
    
    // Define state variables for whether the timelapse is playing, and for the elapsed time
    const [isPlaying, setIsPlaying] = useState(false);
    const [timelapseIsOver, setTimelapseIsOver] = useState(false)
    const [elapsedTime, setElapsedTime] = useState(0);
    const [index, setIndex] = useState(0); // Using useState

    // Use a ref to keep track of the interval timer that's used for the animation
    const timerRef = useRef(null);
    
    // Function to start the timelapse
    const startTimelapse = () => {
        
        // Set the playing state to true
        setIsPlaying(true);

        // Set up an interval timer that ticks every 200ms
        timerRef.current = setInterval(() => {
            
            // On each tick, increment the elapsed time by .2
            setElapsedTime(prevTime => prevTime + 0.25);

        }, 250); 
    };

    // Function to stop the timelapse
    const stopTimelapse = () => {
        // Set the playing state to false
        setIsPlaying(false);

        // Clear the interval timer
        clearInterval(timerRef.current);

        // Reset the state for the next time
        setElapsedTime(0);
        setIndex(0);

        // Update layer colours back to original state
        updateLayerColours(map.current, false, busynessHashMap, busynessHashMap);
    };

    // Combined handler for play and stop functionality
    const handlePlay = () => {

        isPlaying ? stopTimelapse() : startTimelapse();

    };

    // Handle the logic of elapsed time and animation updates
    useEffect(() => {
        if (elapsedTime >= 24) {
            stopTimelapse();
        }

        if (Number.isInteger(elapsedTime) && timelapseData && timelapseData.length > index){
            const ActiveHashMap = timelapseData[index];
            updateLayerColours(map.current, false, originalBusynessHashMap, ActiveHashMap);
            setIndex(index + 1);
        }
    }, [elapsedTime]);

    
    // On component unmount, clear the interval timer to prevent memory leaks
    useEffect(() => {
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }, []);

    // New useEffect to listen to changes 
    useEffect(() => {
        if (timelapseIsOver) {
            updateLayerColours(map.current, false, busynessHashMap, busynessHashMap);
            setTimelapseIsOver(false); // Reset the state for the next time
        }
    }, [timelapseIsOver]);
    
    return (
        <div className='timelapse-container'>
            {/* Button to start/stop the timelapse */}
            <button className="timelapse-button" onClick={handlePlay}>
                <span className="timelapse-arrow"></span>
                <label htmlFor="toggle" className="timelapse-label">{isPlaying ? "pause" : "play"}</label>
            </button>

            {/* The timeline, with a dot that moves according to the elapsed time */}
            <div className="time-line">
                <div className="moving-dot" style={{transform: `translateX(${(elapsedTime) * 100}%)`}} />
            </div>
        </div>
    );
}
    
export default Timelapse;
