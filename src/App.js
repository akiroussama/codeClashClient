import React, { useEffect, useState } from 'react';

function App() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Fetch data from the server
    fetch('https://codeclashserver.onrender.com/events')
      .then(response => response.json())
      .then(data => setEvents(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div className="App">
      <h1>File Save Events</h1>
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            <strong>File:</strong> {event.fileName} <br />
            <strong>Timestamp:</strong> {event.timestamp}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;