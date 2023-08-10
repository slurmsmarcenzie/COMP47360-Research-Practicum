import React from 'react';
import '../App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { useMapContext } from './MapContext';

export default function MobileSearchIcon() {

    const {isNavVisible, setIsNavVisible} = useMapContext();
    const {isMobileTileOpen, setIsMobileTileOpen} =useMapContext()
    const {isTimelapseVisible, setIsTimelapseVisible} = useMapContext();

    return (
        <div className='floating-search-icon-container'>
            <button className='floating-search-icon-container-button'
                onClick={() => {
                    // setIsNavVisible(!isNavVisible);
                    setIsMobileTileOpen(!isMobileTileOpen);
                    if (isTimelapseVisible) {
                        setIsTimelapseVisible(false);
                    }
                }}>
                <FontAwesomeIcon icon={faSearch} style={{color:'#D3D3D3'}}/>
            </button>   
        </div>
    );
}