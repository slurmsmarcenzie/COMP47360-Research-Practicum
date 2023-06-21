import {useEffect, useState} from 'react';
import axios from 'axios';
import './App.css';

/*  
  Dummy React App That sends a prediction request to the Node Application 
  The prediction includes eventname, metric, location, date
  FRONT > NODE > ML API > NODE > FRONT
  Front requests prediction from Node App, node app sends the given args to the ML API which responds
  with a prediction (currently responds with hardcoded dummy variable)
  Node then sends the result back to the Front
  Could also query the ML API directly from the front, but it will eventually be necessary
  to add validation, authenticatin etc and will be best to let Node/Express app handle everything
*/


function App() {
  const [events, setEvents] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [event, setEvent] = useState("event1");
  const [metric, setMetric] = useState("busyness");


  useEffect(() => {
    //Fetch Events
    axios.get("http://localhost:5000/api/meta/events")
    .then(response => {
      if (response.data.length > 0) { 
        setEvents(response.data.map((item) => item.name));
      }
    })
    .catch((error) => {
      console.log(error);
    })

    //Fetch Metrics
    axios.get("http://localhost:5000/api/meta/metrics")
    .then(response => {
      if (response.data.length > 0) {
        setMetrics(response.data.map((item) => item.name));
      }
    })
    .catch((error) => {
      console.log(error);
    })
  }, [])

  const submitFunc = (e) => {
    const location = "burough1" //this is temp
    const date = new Date()
    e.preventDefault();
  
    axios.get(`http://localhost:5000/api/predict/${event}/${metric}/${location}/${date}`)
    .then(response => console.log("success!", response.data))
    .catch((error) => console.log(error))
  };

  return (
    <>
      <h1>My React App</h1>

      <form action="." onSubmit={submitFunc}>
        <select name="event" required value={event} onChange={e => setEvent(e.target.value)}>
          { 
            events.map(function(event) { 
              return <option key={event} value={event}> {event} </option> })
          }
        </select>
        <select name="metric" required value={metric} onChange={(e) => setMetric(e.target.value)}>
          { 
            metrics.map(function(metric) { 
              return <option key={metric} value={metric}> {metric} </option> })
          }
        </select>
        <input type="submit" value="Send" className="btn btn-primary" />
      </form>
    </>
    
  );
}

export default App;
