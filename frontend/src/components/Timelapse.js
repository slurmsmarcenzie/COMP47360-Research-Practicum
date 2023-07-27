import React, { useEffect, useRef, useState } from 'react';
import { useMapContext } from './MapContext';
import "../App.css";

function Timelapse ({map, originalBusynessHashMap, timelapseData, busynessHashMap}) {

    const { updateLayerColours } = useMapContext();
    
    const [isPlaying, setIsPlaying] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [index, setIndex] = useState(0);

    const timerRef = useRef(null);
    
    const startTimelapse = () => {
        setIsPlaying(true);

        timerRef.current = setInterval(() => {
            setElapsedTime(prevTime => prevTime + 1);
        }, 1000);
    };

    const stopTimelapse = () => {
        setIndex(0);
        
        setIsPlaying(false);
        clearInterval(timerRef.current);

        setElapsedTime(0);

        setTimeout(() => {
            updateLayerColours(map.current, false, busynessHashMap, busynessHashMap);
        }, 400)
    };

    const handlePlay = () => {
        isPlaying ? stopTimelapse() : startTimelapse();
    };

    const handleSliderChange = (e) => {

        stopTimelapse(); 
        const newElapsedTime = Number(e.target.value);
        setElapsedTime(newElapsedTime);
    
        // Ensure we have a valid integer index

        const index = Math.floor(newElapsedTime);
        if (timelapseData && timelapseData.length > index) {
            const ActiveHashMap = timelapseData[index];
            updateLayerColours(map.current, false, originalBusynessHashMap, ActiveHashMap);
            setIndex(index);
        }
    };

    useEffect(() => {
        if (elapsedTime >= 24) {
            stopTimelapse();
        }

        if(Number.isInteger(elapsedTime) && timelapseData && timelapseData.length > index){
            const ActiveHashMap = timelapseData[index];
            updateLayerColours(map.current, false, originalBusynessHashMap, ActiveHashMap);
            setIndex(index + 1);
        }
    }, [elapsedTime]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    return (
        <div className='timelapse-container'>
            <button className="timelapse-button" onClick={handlePlay}>
                <span className="timelapse-arrow"></span>
                <label htmlFor="toggle" className="timelapse-label">{isPlaying ? "pause" : "play"}</label>
            </button>
            <div className='slider-container'>
                <input type="range" min="0" max="24" value={elapsedTime} onChange={handleSliderChange} />
            </div>
        </div>
    );
}
export default Timelapse;
