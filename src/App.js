import React from 'react';
import TestRaceTrack from './TestRaceTrack';

function App() {
  return (
    <div className="App">
      <h1>Test Results</h1>
      <TestRaceTrack 
        apiEndpoint="https://codeclashserver.onrender.com/filtered-test-results"
        refreshInterval={5000}
        />
    </div>
  );
}

export default App;