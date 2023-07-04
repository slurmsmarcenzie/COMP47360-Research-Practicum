import React from 'react';
import { useLocation } from 'react-router-dom';

function About() {
  //const location = useLocation();

  // Check if the current location is the About page
  //const isAboutPage = location.pathname === '/about';

  return (
    <div>
      <div className="about-content">
      <h1>A Manhattan Event Impact Analysis Tool</h1>
      <p>
        
        The Event Impact Analysis Tool is an application designed to provide insights into the impact of events on busyness in Manhattan, NYC. By analyzing taxi data supplied by the TLC (Taxi and Limousine Commission), the tool aims to identify patterns and understand how events influence the usual urban flow.
      </p>
      <p>
      This project is developed by a team of 6 individuals as part of a Master's in Computer Science program. 

The Event Impact Analysis Tool is an application designed to provide insights into the impact of events on busyness in Manhattan, NYC. By analyzing taxi data supplied by the TLC (Taxi and Limousine Commission), the tool aims to identify patterns and understand how events influence the usual urban flow.

The target audience for the Event Impact Analysis Tool includes event attendees who are interested in understanding the impact of events on transportation and congestion in Manhattan. It also caters to event organizers and marketers who want to assess the potential impact on transportation when planning and promoting events. Local businesses in Manhattan can benefit from the tool as well, as it helps them understand how events affect foot traffic and customer flow. Furthermore, researchers and analysts interested in urban dynamics, transportation planning, and event impact analysis can utilize the tool for their studies and investigations.

By catering to the needs of these target audiences, the Event Impact Analysis Tool offers valuable insights into the relationship between events and urban dynamics in Manhattan. It serves as a resource for various stakeholders involved in event planning, transportation management, and research in the field, contributing to a better understanding of the impact of events on the bustling city.
      </p>
    </div>
      
    </div>
  );
}

export default About;
