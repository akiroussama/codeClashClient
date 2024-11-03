import React, { useEffect, useState } from 'react';
import './UserTestResults.css'; // Import a CSS file for styling

function UserTestResults() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://codeclashserver.onrender.com/latest-test-results')
      .then(response => response.json())
      .then(data => {
        const formattedData = data.map(user => {
          const testStatus = JSON.parse(user.testStatus);
          return {
            username: user.user,
            date: new Date(parseInt(user.timestamp)).toLocaleString(),
            passed: testStatus.passed,
            failed: testStatus.errors,
            environment: 'N/A', // Placeholder if not available
            vscodeVersion: 'N/A', // Placeholder if not available
            platform: 'N/A' // Placeholder if not available
          };
        });
        setUsers(formattedData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
        setError(error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error loading data</div>;
  }

  return (
    <div className="user-test-results">
      <h2>User Test Results</h2>
      <div className="user-cards">
        {users.map((user) => (
          <div key={user.username} className="user-card">
            <h3>{user.username}</h3>
            <p><strong>Date:</strong> {user.date}</p>
            <p><strong>Passed:</strong> {user.passed}</p>
            <p><strong>Failed:</strong> {user.failed}</p>
            <p><strong>Environment:</strong> {user.environment}</p>
            <p><strong>VSCode Version:</strong> {user.vscodeVersion}</p>
            <p><strong>Platform:</strong> {user.platform}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserTestResults;