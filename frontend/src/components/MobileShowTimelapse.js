import React from 'react';
import '../App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo } from '@fortawesome/free-solid-svg-icons';
import { faVideoSlash } from '@fortawesome/free-solid-svg-icons';
import { useMapContext } from './MapContext';

export default function MobileShowInfoBoxIcon() {


    const {isThereALiveInfoBox, isTimelapseVisible, setIsTimelapseVisible } = useMapContext();

    const handleToggle = () => {
    
        setIsTimelapseVisible(!isTimelapseVisible)
    }

    return (

        ( isThereALiveInfoBox ) && (
            <div className='floating-play-icon-container'>
                <button className='floating-search-icon-container-button'
                    onClick={() => {
                        handleToggle();
                    }}>
                    {isTimelapseVisible ? <FontAwesomeIcon icon={faVideoSlash} style={{color:'#D3D3D3'}}/> : <FontAwesomeIcon icon={faVideo} style={{color:'#D3D3D3'}}/>}
                </button>   
            </div>
       )
    );
}