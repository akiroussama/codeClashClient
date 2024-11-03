// src/components/CarRace.js

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
        setUsers(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    // Fetch data initially
    fetchData();

    // Set up interval to fetch data every 5 seconds
    const intervalId = setInterval(fetchData, 5000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Determine the leader
  const leader = users.reduce((prev, current) => {
    return prev.test_status.passed > current.test_status.passed ? prev : current;
  }, users[0]);

  return (
    <div className="race-container">
      <h2>Car Race Visualization</h2>
      <div className="race-track">
        {/* Start Line */}
        <div className="start-line">
          <span className="flag">🚩 Start</span>
        </div>
        {/* Finish Line */}
        <div className="finish-line">
          <span className="flag">🏁 Finish</span>
        </div>
        {/* Cars */}
        {users.map((user, idx) => {
          const progressPercentage = (user.test_status.passed / user.test_status.total) * 100;

          // Determine car image based on user ID or index
          const carImage = getCarImage(user.id, idx);

          return (
            <div key={user.id} className="car-row">
              <div className="user-info">
                <span className="user-name">{user.user}</span>
                <span className="project-name">{user.project_info.name}</span>
              </div>
              <div className="track">
                <motion.img
                  src={carImage}
                  alt={`${user.user} car`}
                  className={`car ${user.id === leader.id ? 'leader' : ''}`}
                  style={{ zIndex: idx + 1 }}
                  animate={{ x: `calc(${progressPercentage}% - 25px)` }} // Adjust for car width
                  transition={{ type: 'spring', stiffness: 50, damping: 20 }}
                />
              </div>
              <div className="progress-info">
                {user.test_status.passed} / {user.test_status.total} tests passed
                {user.test_status.passed >= user.test_status.total && (
                  <span className="finished-badge">🎉 Finished</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Utility function to select car images
const getCarImage = (id, idx) => {
  const carImages = [
    '/car1.png', // Place your car images in the public folder
    '/car2.png',
    '/car3.png',
    '/car4.png',
    // Add more images as needed
  ];
  return carImages[idx % carImages.length];
};

export default CarRace;