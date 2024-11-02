import React, { useEffect, useState } from 'react';

function UserTestResults() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch user data from the server
    fetch('https://codeclashserver.onrender.com/latest-test-results')
      .then(response => response.json())
      .then(data => setUsers(data))
      .catch(error => console.error('Error fetching user data:', error));
  }, []);

  return (
    <div className="user-test-results">
      <h2>User Test Results</h2>
      <div className="user-cards">
        {users.map((user) => (
          <div key={user.id} className="user-card">
            <h3>{user.name}</h3>
            <p><strong>Last Test Result:</strong> {user.lastTestResult}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserTestResults; 