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

  const fetchData = async () => {
    try {
      const response = await fetch('https://codeclashserver.onrender.com/filtered-test-results');
      const data = await response.json();
      setUsers(data);

      const newlyFinished = data.filter(user => 
        user.test_status.passed >= user.test_status.total && 
        !finishedCars.includes(user.id)
      ).map(user => user.id);
      setFinishedCars(prev => [...prev, ...newlyFinished]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      <div className="race-header">
        <div className="title-section">
          <h2>Car Race Visualization <span className="checkered-flag">🏁</span></h2>
          <button 
            onClick={fetchData}
            className="refresh-button"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="race-track">
        <div className="start-line">
        <div className="start-flag">
          <span className="flag-icon">🚩</span>
          <span className="flag-text">Start</span>
        </div>

        </div>
        <div className="finish-line">
        <div className="finish-flag">
          <span className="flag-icon">🏁</span>
          <span className="flag-text">Finish</span>
        </div>
        </div>

        {users.map((user, idx) => {
          const isFinished = user.test_status.passed >= user.test_status.total;
          const progress = user.test_status.passed / user.test_status.total;
          const trackWidth = trackWidths[idx] || 0;
          const maxX = trackWidth - 60;
          const xPos = isFinished ? maxX : progress * maxX;

          return (
            <div key={user.id} className="car-row">
              <div className="player-info">
                <div className="player-name">{user.user}</div>
                <div className="project-name">{user.project_info.name}</div>
              </div>

              <div className="track-container">
                <div className="track" ref={el => trackRefs.current[idx] = el}>
                  <motion.img
                    src={getCarImage(user.id, idx)}
                    alt={`${user.user} car`}
                    className={`car ${user.id === leader?.id ? 'leader' : ''} ${
                      isFinished ? 'finished' : ''
                    }`}
                    style={{ zIndex: idx + 1 }}
                    animate={{
                      x: xPos,
                      scale: isFinished ? 1.1 : 1,
                    }}
                    transition={{
                      x: { type: 'spring', stiffness: 50, damping: 20 },
                      scale: { duration: 0.3 }
                    }}
                  />
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
              </div>

              <div className="progress-info">
                <span className="test-count">
                  {user.test_status.passed} / {user.test_status.total} tests passed
                </span>
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

export default CarRace;

const getCarImage = (id, idx) => {
  const carImages = [
    '/car1.png',
    '/car2.png',
    '/car3.png',
    '/car4.png',
  ];
  return carImages[idx % carImages.length];
};
