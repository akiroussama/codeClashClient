// CarRace.jsx
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import './CarRace.css';

// New Enhanced Title Component
const RaceTitle = () => (
  <div className="race-title-wrapper">
    <motion.h1 
      className="race-title"
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <span className="title-text">Car Race</span>
      <motion.span 
        className="title-flag"
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        🏁
      </motion.span>
    </motion.h1>
  </div>
);

// Enhanced Player Info Component
const PlayerInfo = ({ username, project, isLeader }) => (
  <motion.div 
    className="enhanced-player-info"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="player-avatar">
      {username.charAt(0).toUpperCase()}
    </div>
    <div className="player-details">
      <h3 className="enhanced-player-name">
        {username}
        {isLeader && <span className="leader-crown">👑</span>}
      </h3>
      <div className="enhanced-project-name">
        <span className="project-icon">🚀</span>
        {project}
      </div>
    </div>
  </motion.div>
);

// Enhanced Track Component
const RaceTrack = ({ children, isStart, isFinish }) => (
  <div className="enhanced-track">
    {isStart && (
      <motion.div 
        className="track-marker start"
        animate={{ y: [-5, 0, -5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="marker-flag">🚦</span>
        <span className="marker-text">START</span>
      </motion.div>
    )}
    {children}
    {isFinish && (
      <motion.div 
        className="track-marker finish"
        animate={{ y: [-5, 0, -5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="marker-flag">🏁</span>
        <span className="marker-text">FINISH</span>
      </motion.div>
    )}
  </div>
);

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
    {/* Replace the existing title with the new RaceTitle component */}
    <RaceTitle />
    
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
      {/* Replace the existing start and finish line with the new RaceTrack component */}
      <RaceTrack isStart={true} isFinish={true}>
        {/* Keep the existing dynamic track environment */}
        <div className="clouds">
          {/* ... */}
        </div>
      </RaceTrack>

      {/* Replace the existing player info with the new PlayerInfo component */}
      {filteredUsers.map((user, idx) => (
        <div key={user.id} className="car-row">
          <PlayerInfo
            username={user.user}
            project={user.project_info.name}
            isLeader={user.id === leader?.id}
          />
          {/* Keep the existing track and car components */}
          <div className="track-container">
            <div className="track" ref={el => trackRefs.current[idx] = el}>
              <CarWithEffects
                user={user}
                index={idx}
                isLeader={user.id === leader?.id}
              />
            </div>
          </div>
          {/* ... */}
        </div>
      ))}
    </div>

    {/* Keep the existing confetti effect */}
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