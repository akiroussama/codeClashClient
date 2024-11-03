import React, { useEffect, useState } from 'react';
import './CarRace.css';
import { motion } from 'framer-motion';

const CarRace = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://codeclashserver.onrender.com/filtered-test-results');
        const data = await response.json();
        handleIncomingData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    // Fetch data immediately and then every 15 seconds
    fetchData();
    const intervalId = setInterval(fetchData, 15000);

    return () => clearInterval(intervalId);
  }, []);

  const handleIncomingData = (data) => {
    // Assuming data is an array of user test results
    setUsers((prevUsers) => {
      const updatedUsers = [...prevUsers];
      data.forEach((userData) => {
        const index = updatedUsers.findIndex((user) => user.id === userData.id);
        if (index !== -1) {
          updatedUsers[index] = userData;
        } else {
          updatedUsers.push(userData);
        }
      });
      return updatedUsers;
    });
  };

  // Calculate maximum totalTests to set the track length
  const maxTotalTests = Math.max(...users.map((user) => user.test_status.total), 100);

  return (
    <div className="race-container">
      <h2>Car Race Visualization</h2>
      <div className="race-track">
        {users.map((user) => {
          const progressPercentage = (user.test_status.passed / user.test_status.total) * 100;

          return (
            <div key={user.id} className="car-row">
              <div className="user-info">
                <span className="user-name">{user.user}</span>
                <span className="project-name">{user.project_info.name}</span>
              </div>
              <div className="track">
                <div className="finish-line">Finish Line</div>
                <motion.div
                  className="car"
                  style={{ backgroundColor: getRandomColor(user.id) }}
                  animate={{ left: `${progressPercentage}%` }}
                  transition={{ type: 'spring', stiffness: 50, damping: 20 }}
                >
                  🚗
                </motion.div>
              </div>
              <div className="progress-info">
                {user.test_status.passed} / {user.test_status.total} tests passed
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Utility function to generate consistent colors based on user ID
const getRandomColor = (id) => {
  const colors = [
    '#e74c3c',
    '#2ecc71',
    '#3498db',
    '#9b59b6',
    '#f1c40f',
    '#e67e22',
    '#1abc9c',
    '#34495e',
  ];
  return colors[id % colors.length];
};

export default CarRace;