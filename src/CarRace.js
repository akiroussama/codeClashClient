// CarRace.js
import React, { useEffect, useState, useRef } from 'react';
import './CarRace.css';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';


const CarRace = () => {
  const [users, setUsers] = useState([]);
  const trackRefs = useRef([]);
  const [trackWidths, setTrackWidths] = useState([]);
  const [finishedCars, setFinishedCars] = useState([]);
  const { width, height } = useWindowSize();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://codeclashserver.onrender.com/filtered-test-results');
        const data = await response.json();
        setUsers(data);

        // Identify finished cars
        const newlyFinished = data.filter(user => 
          user.test_status.passed >= user.test_status.total && 
          !finishedCars.includes(user.id)
        ).map(user => user.id);
        setFinishedCars(prev => [...prev, ...newlyFinished]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, [finishedCars]);

  useEffect(() => {
    const updateTrackWidths = () => {
      if (trackRefs.current.length > 0) {
        const widths = trackRefs.current.map(track => track.offsetWidth);
        setTrackWidths(widths);
      }
    };

    const debounce = (func, delay) => {
      let debounceTimer;
      return function() {
        const context = this;
        const args = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(context, args), delay);
      };
    };

    const debouncedUpdate = debounce(updateTrackWidths, 100);
    updateTrackWidths();
    window.addEventListener('resize', debouncedUpdate);
    return () => window.removeEventListener('resize', debouncedUpdate);
  }, [users]);

  const leader = users.reduce((prev, current) => {
    return prev?.test_status.passed > current?.test_status.passed ? prev : current;
  }, users[0]);

  return (
    <div className="race-container">
      <h2>🏎️ Car Race Visualization 🏁</h2>
      <div className="race-track">
        {/* Start Line */}
        <div className="start-line">
          <div className="flag-container">
            <div className="flag-flag">🚩</div>
            <div className="flag-text">Start</div>
          </div>
        </div>
        {/* Finish Line */}
        <div className="finish-line">
          <div className="finish-line-glow"></div>
          <div className="flag-container">
            <div className="flag-flag">🏁</div>
            <div className="flag-text">Finish</div>
          </div>
        </div>

        {users.map((user, idx) => {
          const isFinished = user.test_status.passed >= user.test_status.total;
          const progress = user.test_status.passed / user.test_status.total;
          const trackWidth = trackWidths[idx] || 0; // Fallback to 0 if not measured yet
          const maxX = trackWidth - 60; // 50px car width + 10px buffer

          const xPos = isFinished ? maxX : progress * maxX;

          return (
            <div key={user.id} className="car-row">
              <div className="user-info">
                <span className="user-name">{user.user}</span>
                <span className="project-name">{user.project_info.name}</span>
              </div>

              <div className="track" ref={el => trackRefs.current[idx] = el}>
                <motion.img
                  src={getCarImage(user.id, idx)}
                  alt={`${user.user} car`}
                  className={`car ${user.id === leader?.id ? 'leader' : ''} ${
                    isFinished ? 'finished' : ''
                  }`}
                  style={{ 
                    zIndex: idx + 1,
                    left: 0,
                  }}
                  animate={{
                    x: xPos,
                    scale: isFinished ? 1.1 : 1,
                  }}
                  transition={{
                    x: { type: 'spring', stiffness: 50, damping: 20 },
                    scale: { duration: 0.3 }
                  }}
                />
                {/* Trigger Confetti */}
                {isFinished && (
                  <Confetti 
                    width={width} 
                    height={height} 
                    numberOfPieces={200} 
                    recycle={false} 
                    gravity={0.3}
                    colors={['#FFC107', '#FF5722', '#4CAF50', '#2196F3', '#9C27B0']}
                  />
                )}
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