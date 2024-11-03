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

  // Calculate finish line position (slightly before the actual end to account for car width)
  const FINISH_LINE_POSITION = 98; // 98% of the track width

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
          const isFinished = user.test_status.passed >= user.test_status.total;
          // Calculate progress percentage with finish line consideration
          const progressPercentage = isFinished 
            ? FINISH_LINE_POSITION 
            : (user.test_status.passed / user.test_status.total) * FINISH_LINE_POSITION;

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
                  className={`car ${user.id === leader.id ? 'leader' : ''} ${isFinished ? 'finished' : ''}`}
                  style={{ zIndex: idx + 1 }}
                  animate={{
                    x: `${progressPercentage}%`,
                    scale: isFinished ? 1.1 : 1, // Slight scale up when finished
                  }}
                  transition={{
                    x: { type: 'spring', stiffness: 50, damping: 20 },
                    scale: { duration: 0.3 }
                  }}
                />
              </div>
              <div className="progress-info">
                {user.test_status.passed} / {user.test_status.total} tests passed
                {isFinished && (
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

const getCarImage = (id, idx) => {
  const carImages = [
    '/car1.png',
    '/car2.png',
    '/car3.png',
    '/car4.png',
  ];
  return carImages[idx % carImages.length];
};

export default CarRace;