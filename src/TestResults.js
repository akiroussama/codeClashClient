@ -0,0 +1,27 @@
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function TestResults() {
  const [results, setResults] = useState({ passed: 0, failed: 0 });

  useEffect(() => {
    // Fetch test results from the backend
    axios.get('https://codeclashserver.onrender.com/test-results')
      .then(response => {
        setResults(response.data);
      })
      .catch(error => {
        console.error('Error fetching test results:', error);
      });
  }, []);

  return (
    <div>
      <h2>Test Results</h2>
      <p>Passed: {results.passed}</p>
      <p>Failed: {results.failed}</p>
    </div>
  );
}

export default TestResults;