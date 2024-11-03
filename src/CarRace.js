import React, { useEffect, useState } from 'react';
import './CarRace.css';
import { motion } from 'framer-motion';

const CarRace = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch data from the REST API
    const fetchData = async () => {
      try {
        const response = await fetch('https://codeclashserver.onrender.com/filtered-test-results');
        const data = await response.json();
        handleIncomingData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    // Optionally, set an interval to fetch data periodically
    const intervalId = setInterval(fetchData, 5000); // Fetch every 5 seconds

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
                  className="car"
                  style={{ zIndex: idx + 1 }}
                  animate={{ x: `${progressPercentage}%` }}
                  transition={{ type: 'spring', stiffness: 50, damping: 20 }}
                />
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