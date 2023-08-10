import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp} from '@fortawesome/free-solid-svg-icons';
import { useMapContext } from './MapContext';

const Accordion = ({ title, content, onClick }) => {
  const [isActive, setIsActive] = useState(false);

  const {isAccordionActive, setIsAccordionActive} = useMapContext();


  const handleOnClick = () => {
    setIsActive(!isActive);
    setIsAccordionActive(!isAccordionActive); // Toggle the parent's state directly
    // Call the onClick prop if provided
    if (onClick) {
      onClick();
    }
  };

  return (
    <div className="accordion-item-mobile">
      <div
        className={`accordion-title ${isActive ? 'pressed' : ''}`}
        onClick={handleOnClick}
        
      >
        <div className="acc-title">{title}</div>
        <FontAwesomeIcon icon={isActive ? faChevronUp : faChevronDown} style={{ fontSize: '12px' }} />
      </div>
      {isActive && <div className="accordion-content">{content}</div>}
    </div>
  );
};

export default Accordion;
