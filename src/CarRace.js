// CarRace.jsx
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import './CarRace.css';

const CarRace = () => {
const [users, setUsers] = useState([]);
const trackRefs = useRef([]);
const [trackWidths, setTrackWidths] = useState([]);
const [finishedCars, setFinishedCars] = useState([]);
const { width, height } = useWindowSize();
const [highestProgress, setHighestProgress] = useState({});
const [projectFilter, setProjectFilter] = useState('');
const [isLoading, setIsLoading] = useState(true);

const filteredUsers = users.filter(user => 
  projectFilter === '' || user.project_info.name === projectFilter
);

const uniqueProjects = [...new Set(users.map(user => user.project_info.name))];

const leader = filteredUsers.reduce((prev, current) => {
  return prev?.test_status.passed > current?.test_status.passed ? prev : current;
}, filteredUsers[0]);

const fetchData = async () => {
  try {
    setIsLoading(true);
    const response = await fetch('https://codeclashserver.onrender.com/filtered-test-results');
    const data = await response.json();
    setUsers(data);

    const newHighestProgress = { ...highestProgress };
    data.forEach(user => {
      const currentProgress = user.test_status.passed / user.test_status.total;
      newHighestProgress[user.id] = Math.max(
        currentProgress,
        highestProgress[user.id] || 0
      );
    });
    setHighestProgress(newHighestProgress);

    const newlyFinished = data.filter(user => 
      user.test_status.passed >= user.test_status.total && 
      !finishedCars.includes(user.id)
    ).map(user => user.id);
    setFinishedCars(prev => [...prev, ...newlyFinished]);
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    setIsLoading(false);
  }
};

useEffect(() => {
  fetchData();
}, []);

useEffect(() => {
  const updateTrackWidths = () => {
    if (trackRefs.current.length > 0) {
      const widths = trackRefs.current.map(track => track?.offsetWidth || 0);
      setTrackWidths(widths);
    }
  };

  const debouncedUpdate = debounce(updateTrackWidths, 100);
  updateTrackWidths();
  window.addEventListener('resize', debouncedUpdate);
  return () => window.removeEventListener('resize', debouncedUpdate);
}, [users]);

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const CarWithEffects = ({ user, index, isLeader }) => {
  const isFinished = user.test_status.passed >= user.test_status.total;
  const currentProgress = user.test_status.passed / user.test_status.total;
  const progress = Math.max(currentProgress, highestProgress[user.id] || 0);
  const trackWidth = trackWidths[index] || 0;
  const maxX = trackWidth - 60;
  const xPos = isFinished ? maxX : progress * maxX;

  return (
    <div className="car-wrapper">
      <motion.div
        className={`car-container ${isLeader ? 'leader' : ''}`}
        animate={{
          x: xPos,
          scale: isFinished ? 1.1 : 1,
        }}
        transition={{
          x: { type: "spring", stiffness: 50, damping: 20 },
          scale: { duration: 0.3 }
        }}
      >
        {/* Light Trail Effect */}
        <div className="light-trail" />
        
        {/* Progress Particles */}
        {progress > 0 && (
          <div className="progress-particles">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  '--delay': `${i * 0.2}s`,
                  '--x': `${Math.random() * 40 - 20}px`
                }}
              />
            ))}
          </div>
        )}

        {/* Car Image with Effects */}
        <img 
          src={getCarImage(user.id, index)}
          alt="racing car"
          className={`car ${isLeader ? 'leader' : ''} ${isFinished ? 'finished' : ''}`}
        />

        {/* Speed Lines */}
        {progress > 0 && (
          <div className="speed-lines">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className="speed-line"
                style={{ '--delay': `${i * 0.1}s` }}
              />
            ))}
          </div>
        )}

        {/* Leader Crown */}
        {isLeader && <div className="crown">👑</div>}
      </motion.div>
    </div>
  );
};

return (
  <div className="race-container">
    <div className="race-header">
      <div className="title-section">
        <h2 className="glowing-text">Car Race Visualization <span className="checkered-flag">🏁</span></h2>
        <div className="controls">
          <select 
            value={projectFilter} 
            onChange={(e) => setProjectFilter(e.target.value)}
            className="project-filter"
          >
            <option value="">All Projects</option>
            {uniqueProjects.map(project => (
              <option key={project} value={project}>{project}</option>
            ))}
          </select>
          <button 
            onClick={fetchData}
            className="refresh-button"
            disabled={isLoading}
          >
            {isLoading ? '⌛' : '🔄'} Refresh
          </button>
        </div>
      </div>
    </div>

    <div className="race-track">
      {/* Start Line */}
      <div className="start-line">
        <div className="start-flag">
          <span className="flag-icon">🚩</span>
          <span className="flag-text">Start</span>
        </div>
      </div>

      {/* Finish Line */}
      <div className="finish-line">
        <div className="finish-flag">
          <span className="flag-icon">🏁</span>
          <span className="flag-text">Finish</span>
        </div>
      </div>

      {/* Dynamic Track Environment */}
      <div className="clouds">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="cloud" style={{ '--speed': `${20 + i * 5}s` }} />
        ))}
      </div>

      {/* Race Tracks */}
      {filteredUsers.map((user, idx) => {
        const isFinished = user.test_status.passed >= user.test_status.total;

        return (
          <div key={user.id} className="car-row">
            <div className="player-info">
              <div className="player-name">{user.user}</div>
              <div className="project-name">{user.project_info.name}</div>
            </div>

            <div className="track-container">
              <div 
                className="track" 
                ref={el => trackRefs.current[idx] = el}
              >
                <CarWithEffects
                  user={user}
                  index={idx}
                  isLeader={user.id === leader?.id}
                />
              </div>
            </div>

            <div className="progress-info">
              <div className="progress-indicator">
                <div 
                  className="progress-bar"
                  style={{ 
                    width: `${(user.test_status.passed / user.test_status.total) * 100}%` 
                  }}
                />
                <span className="progress-text">
                  {user.test_status.passed} / {user.test_status.total} tests passed
                </span>
              </div>
              {isFinished && (
                <span className="finished-badge">🎉 Finished!</span>
              )}
            </div>
          </div>
        );
      })}
    </div>

    {/* Confetti Effect for Finished Cars */}
    {finishedCars.length > 0 && (
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