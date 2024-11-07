// CarRace.jsx
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import './CarRace.css';
import UserCard from './components/UserCard';

// Enhanced Title Component
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

// Enhanced Track Component with Premium Styling
const RaceTrack = ({ children, isStart, isFinish }) => (
  <div className="track-container">
    <div className="enhanced-track">
      {/* {isStart && ( */}
        <motion.div 
          className="track-marker start"
          initial={{ x: -10, opacity: 0 }}
          animate={{ 
            x: 0, 
            opacity: 1,
            y: [-5, 0, -5]
          }}
          transition={{ 
            x: { duration: 0.5 },
            opacity: { duration: 0.5 },
            y: { duration: 2, repeat: Infinity }
          }}
        >
          <span className="marker-flag">🚦</span>
          <span className="marker-text">START</span>
        </motion.div>
      {/* )} */}
      <div className="track-surface">
        <div className="track-dots"></div>
        <div className="track-lights"></div>
        <div className="track-barrier"></div>
        {children}
      </div>
      {/* {isFinish && ( */}
        <motion.div 
          className="track-marker finish"
          initial={{ x: 10, opacity: 0 }}
          animate={{ 
            x: 0, 
            opacity: 1,
            y: [-5, 0, -5]
          }}
          transition={{ 
            x: { duration: 0.5 },
            opacity: { duration: 0.5 },
            y: { duration: 2, repeat: Infinity }
          }}
        >
          <span className="marker-flag">🏁</span>
          <span className="marker-text">FINISH</span>
        </motion.div>
      {/* )} */}
    </div>
  </div>
);

// Add this new component for enhanced car effects
const CarEffects = () => (
  <div className="speed-particles">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="speed-particle"
        style={{
          top: `${(i + 1) * 20}%`,
          animationDelay: `${i * 0.1}s`
        }}
      />
    ))}
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
  const [isDayMode, setIsDayMode] = useState(true);

  const filteredUsers = Array.isArray(users) 
    ? users.filter(user => projectFilter === '' || user.project_info.name === projectFilter)
    : [];

  const uniqueProjects = [...new Set(Array.isArray(users) ? users.map(user => user.project_info.name) : [])];

  const leader = filteredUsers.reduce((prev, current) => {
    return prev?.test_status.passed > current?.test_status.passed ? prev : current;
  }, filteredUsers[0]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('https://codeclashserver.onrender.com/filtered-test-results');
      const data = await response.json();
      
      // Add safety check to ensure data is an array
      if (!Array.isArray(data)) {
        console.error('Received invalid data format:', data);
        return;
      }
      
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
      setUsers([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
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

  // Update the CarWithEffects component
  const CarWithEffects = ({ user, index, isLeader }) => {
    const isFinished = user.test_status.passed >= user.test_status.total;
    const currentProgress = user.test_status.passed / user.test_status.total;
    const progress = Math.max(currentProgress, highestProgress[user.id] || 0);
    const trackWidth = trackWidths[index] || 0;
    const maxX = trackWidth - 80; // Adjusted for new car width
    const xPos = isFinished ? maxX : progress * maxX;

    return (
      <motion.div
        className={`car-wrapper ${isLeader ? 'leader' : ''} ${isFinished ? 'finished' : ''}`}
        animate={{
          x: xPos,
          scale: isFinished ? 1.1 : 1,
        }}
        transition={{
          x: { type: "spring", stiffness: 50, damping: 20 },
          scale: { duration: 0.3 }
        }}
      >
        <div className="car-container">
          <CarEffects />
          <motion.img 
            src={`/car${Math.floor(Math.random() * 17) + 1}.png`}
            alt="racing car"
            className="car-image"
            animate={{
              y: [0, -2, 0],
              rotate: isLeader ? [-2, 2, -2] : 0
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          {isLeader && (
            <motion.div 
              className="crown"
              animate={{
                y: [-2, 2, -2],
                rotate: [-10, 10, -10]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              👑
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`race-container ${isDayMode ? 'day-mode' : 'night-mode'}`}>
      <RaceTitle />
      
      <div className="race-header">
        <div className="controls-section">
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
            {isLoading ? '⌛' : '🔄'}
          </button>
          <button 
            onClick={() => setIsDayMode(!isDayMode)}
            className="mode-toggle"
          >
            {isDayMode ? '🌙' : '☀️'}
          </button>
        </div>
      </div>

      <div className="race-tracks">
        {filteredUsers.map((user, idx) => (
          <div key={user.id} className="race-track-row">
            <UserCard
              username={user.user}
              score={user.test_status.passed}
              total={user.test_status.total}
              percentage={(user.test_status.passed / user.test_status.total * 100).toFixed(1)}
              isActive={user.id === leader?.id}
              position={idx + 1}
            />
            <RaceTrack isStart={idx === 0} isFinish={idx === 0}>
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
            </RaceTrack>
          </div>
        ))}
      </div>

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
    '/car5.png',
    '/car6.png',
    '/car7.png',
    '/car8.png',
    '/car9.png',
    '/car10.png',
    '/car11.png',
    '/car12.png',
    '/car13.png',
    '/car14.png',
    '/car15.png',
    '/car16.png'
  ];
  return carImages[idx % carImages.length];
};

export default CarRace;