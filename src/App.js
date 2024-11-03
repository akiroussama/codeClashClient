import React from 'react';
import TestRaceTrack from './TestRaceTrack';
import CarRace from './CarRace';
function App() {
  return (
    <div className="App">
      <h1>Test Results</h1>
      <TestRaceTrack 
        apiEndpoint="https://codeclashserver.onrender.com/filtered-test-results"
        refreshInterval={5000}
        />
         <CarRace />
    </div>
  );
}

export default App;