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

    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const leader = users.reduce((prev, current) => {
    return prev?.test_status.passed > current?.test_status.passed ? prev : current;
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

        {users.map((user, idx) => {
          const isFinished = user.test_status.passed >= user.test_status.total;
          // Calculate progress with car width consideration
          const progress = user.test_status.passed / user.test_status.total;
          // Adjust final position to account for car width and track padding
          const progressPercentage = isFinished 
            ? 'calc(100% - 60px)' // 50px car width + 10px buffer
            : `calc(${progress * 100}% - 60px)`;

          return (
            <div key={user.id} className="car-row">
              <div className="user-info">
                <span className="user-name">{user.user}</span>
                <span className="project-name">{user.project_info.name}</span>
              </div>
              
              <div className="track">
                <motion.img
                  src={getCarImage(user.id, idx)}
                  alt={`${user.user} car`}
                  className={`car ${user.id === leader?.id ? 'leader' : ''} ${
                    isFinished ? 'finished' : ''
                  }`}
                  style={{ 
                    zIndex: idx + 1,
                    left: 0, // Set initial position
                  }}
                  animate={{
                    x: progressPercentage,
                    scale: isFinished ? 1.1 : 1,
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