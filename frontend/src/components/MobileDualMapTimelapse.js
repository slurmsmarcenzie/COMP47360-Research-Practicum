import React, { useEffect, useRef, useState } from 'react';
import { useMapContext } from './MapContext';
import "../App.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';

function DualMapTimelpase ({topMap, bottomMap, originalBusynessHashMap, timelapseData, baselineTimelapseData, busynessHashMap}) {

    const { updateLayerColours, neighbourhoodEvents } = useMapContext();

    const [isPlaying, setIsPlaying] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [index, setIndex] = useState(0);
    const [currentEvent, setCurrentEvent] = useState(null);

    const timerRef = useRef(null);

    useEffect(() => {
        setCurrentEvent(neighbourhoodEvents[0])
    }, [neighbourhoodEvents]);
    
    const startTimelapse = () => {
        setIsPlaying(true);

        timerRef.current = setInterval(() => {
            setElapsedTime(prevTime => prevTime + 1);
        }, 1000);
    };

    const pauseTimelapse = () => {
        setIsPlaying(false);
        clearInterval(timerRef.current);
    };

    const handlePlay = () => {
        isPlaying ? pauseTimelapse() : startTimelapse();
    };

    const endTimelapse = () => {
        
        const resetPosition = baselineTimelapseData[16]

        setIndex(0);
        setElapsedTime(0);
        setIsPlaying(false);
        clearInterval(timerRef.current);

        setTimeout(() => {
            updateLayerColours(topMap.current, false, busynessHashMap, resetPosition);
            updateLayerColours(bottomMap.current, false, busynessHashMap, busynessHashMap);
        }, 400)
    }

    const handleSliderChange = (e) => {

        pauseTimelapse(); 
        const newElapsedTime = Number(e.target.value);
        setElapsedTime(newElapsedTime);
    
        // Ensure we have a valid integer index
        const index = Math.floor(newElapsedTime);
        if (timelapseData && timelapseData.hasOwnProperty(index)) {
            const TimelapseHashMap = timelapseData[index];
            const BaselineHashMap = baselineTimelapseData[index];
            updateLayerColours(bottomMap.current, false, originalBusynessHashMap, TimelapseHashMap);
            updateLayerColours(topMap.current, false, originalBusynessHashMap, BaselineHashMap);
            setIndex(index);
        }
    };

    useEffect(() => {

        if (elapsedTime >= 24) {
            endTimelapse();
        }

        if(Number.isInteger(elapsedTime) && timelapseData && timelapseData.hasOwnProperty(index)){
            const TimelapseHashMap = timelapseData[index];
            const BaselineHashMap = baselineTimelapseData[index];
            updateLayerColours(bottomMap.current, false, originalBusynessHashMap, TimelapseHashMap);
            updateLayerColours(topMap.current, false, originalBusynessHashMap, BaselineHashMap);
            setIndex(index + 1);
        }
        
    }, [elapsedTime]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    return (
        <div className='timelapse-container-mobile'>
            <button className="timelapse-button" onClick={handlePlay}>
                {isPlaying ? <FontAwesomeIcon icon={faPause} style={{color:'#D3D3D3'}}/> : <FontAwesomeIcon icon={faPlay} style={{color:'#D3D3D3'}}/>}
                <label htmlFor="toggle" className="timelapse-label">{isPlaying ? "pause" : "play"}</label>
            </button>
            <div className='slider-container-parent'>
                <div className='slider-context-container'>
                    <p className='elapsed-time-text'> Local Time: {elapsedTime >= 10 ? '' : 0}{elapsedTime}:00 {elapsedTime >= 12 ? 'PM' : 'AM'}</p>
                </div>
                <div className='slider-container'>
                    <input type="range" min="0" max="24" value={elapsedTime} onChange={handleSliderChange} />
                </div>
            </div>
        </div>
    );
}
export default DualMapTimelpase;
