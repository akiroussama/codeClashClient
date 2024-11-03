import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TestStatus = () => {
  const [testStatuses, setTestStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTestStatuses = async () => {
      try {
        const response = await axios.get('/test-status');
        setTestStatuses(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch test status updates');
        setLoading(false);
      }
    };

    fetchTestStatuses();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="test-status-container">
      <h2>Test Status Updates</h2>
      {testStatuses.map((status, index) => (
        <div key={index} className="status-card">
          <h3>Test Run at {new Date(status.timestamp).toLocaleString()}</h3>
          
          <div className="status-section">
            <h4>Test Status</h4>
            <pre>{JSON.stringify(status.test_status, null, 2)}</pre>
          </div>

          <div className="status-section">
            <h4>Project Info</h4>
            <pre>{JSON.stringify(status.project_info, null, 2)}</pre>
          </div>

          <div className="status-section">
            <h4>Git Info</h4>
            <pre>{JSON.stringify(status.git_info, null, 2)}</pre>
          </div>

          <div className="status-section">
            <h4>Test Runner Info</h4>
            <pre>{JSON.stringify(status.test_runner_info, null, 2)}</pre>
          </div>

          <div className="status-section">
            <h4>Environment</h4>
            <pre>{JSON.stringify(status.environment, null, 2)}</pre>
          </div>

          <div className="status-section">
            <h4>Execution</h4>
            <pre>{JSON.stringify(status.execution, null, 2)}</pre>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TestStatus;
