import React from 'react';
import '../App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useMapContext } from './MapContext';

export default function MobileShowInfoBoxIcon() {


    const {showInfoBox, setShowInfoBox, showNeighborhoodInfoBox, isDrawerOpen, setIsDrawerOpen, isThereALiveInfoBox } = useMapContext();

    const handleToggle = () => {
      setIsDrawerOpen(!isDrawerOpen);
    };

    return (

        ( isThereALiveInfoBox ) && (
            <div className='floating-eye-icon-container'>
                <button className='floating-search-icon-container-button'
                    onClick={() => {
                        setShowInfoBox(!showInfoBox);
                        handleToggle();
                    }}>
                    {isDrawerOpen ? <FontAwesomeIcon icon={faEye} style={{color:'#D3D3D3'}}/> : <FontAwesomeIcon icon={faEyeSlash} style={{color:'#D3D3D3'}}/>}
                </button>   
            </div>
       )
    );
}