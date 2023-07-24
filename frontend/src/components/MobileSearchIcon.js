import React, { useState } from 'react';
import '../App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { useMapContext } from './MapContext';

export default function MobileSearchIcon() {

    const {isNavVisible, setIsNavVisible} = useMapContext();

    return (
        <div className='floating-search-icon-container'>
            <button className='floating-search-icon-container-button'
                onClick={() => {
                    setIsNavVisible(!isNavVisible);
                }}>
                <FontAwesomeIcon icon={faSearch} />
            </button>   
        </div>
    );
}