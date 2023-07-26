import React, {useState, useRef, useEffect} from 'react';
import scores from '../geodata/output.json'
import "../App.css";
import { useMapContext } from './MapContext';

function Timelapse ({map, originalBusynessHashMap, eventBaselineHashMap, busynessHashMap}) {

    const {updateLayerColours} = useMapContext();
    
    // Define state variables for whether the timelapse is playing, and for the elapsed time
    const [isPlaying, setIsPlaying] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [flag, setFlag] = useState(false)

    // Use a ref to keep track of the interval timer that's used for the animation
    const timerRef = useRef(null);
    
    // Function to start or stop the timelapse
    const handlePlay = () => {
        // Toggle the playing state
        setIsPlaying(!isPlaying);

        // If we are going to start playing, set up an interval timer that ticks every 1000ms (1 second)
        if (!isPlaying) {
            timerRef.current = setInterval(() => {
                // On each tick, increment the elapsed time by 1
                setElapsedTime(prevTime => prevTime + 0.25);
            }, 125); // set to 1000ms which equals 1 second
        } else {
            // If we are going to stop playing, clear the interval timer
            clearInterval(timerRef.current);
        }
    };

    // If the elapsed time has reached 24 seconds, stop the animation and reset everything
    useEffect(() => {
        
        if (elapsedTime >= 24) {
            setIsPlaying(false);
            setElapsedTime(0);
            clearInterval(timerRef.current);
        }

        if(elapsedTime % 2 === 0){
            console.log(elapsedTime);
            updateLayerColours(map.current, flag, originalBusynessHashMap, busynessHashMap)
            setFlag(!flag)
        }
    }, [elapsedTime]);
    
    // On component unmount, clear the interval timer to prevent memory leaks
    useEffect(() => {
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }, []);
    
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
