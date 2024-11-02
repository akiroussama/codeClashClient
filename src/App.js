import React, { useEffect, useState } from 'react';
import TestResults from './TestResults';
import UserTestResults from './UserTestResults';

function App() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Fetch events from the server
    fetch('https://codeclashserver.onrender.com/events')
      .then(response => response.json())
      .then(data => setEvents(data))
      .catch(error => console.error('Error fetching events:', error));
  }, []);

  return (
    <div className="App">
      <h1>File Save Events</h1>
      <TestResults />
      <UserTestResults />
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