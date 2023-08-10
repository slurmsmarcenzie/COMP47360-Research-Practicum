import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp} from '@fortawesome/free-solid-svg-icons';

const Accordion = ({ title, content }) => {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="accordion-item-mobile">
      <div 
        className={`accordion-title ${isActive ? 'pressed' : ''}`}
        onClick={() => setIsActive(!isActive)}
      >        <div className ="acc-title">{title}</div>
        <FontAwesomeIcon icon={isActive ? faChevronUp : faChevronDown} style={{ fontSize: '12px' }} />
      </div>
      {isActive && <div className="accordion-content">{content}</div>}
    </div>
  );
};

export default Accordion;