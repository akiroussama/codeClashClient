import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import './RaceTrack.css';

const RaceTrack = () => {
  const [users, setUsers] = useState([]);
  const trackRefs = useRef([]);
  const [trackWidths, setTrackWidths] = useState([]);
  const [finishedCars, setFinishedCars] = useState([]);
  const { width, height } = useWindowSize();
  const [highestProgress, setHighestProgress] = useState({});
  const [projectFilter, setProjectFilter] = useState('testing_clash');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const filteredUsers = users.filter(user => 
    projectFilter === '' || user.project_info.name === projectFilter
  );

  const uniqueProjects = [...new Set(users.map(user => user.project_info.name))];

  const leader = filteredUsers.reduce((prev, current) => {
    return (prev?.test_status.passed / prev?.test_status.total) > 
           (current?.test_status.passed / current?.test_status.total) ? prev : current;
  }, filteredUsers[0]);

  const fetchRaceData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('https://codeclashserver.onrender.com/filtered-test-results');
      if (!response.ok) throw new Error('Failed to fetch race data');
      const data = await response.json();
      
      setUsers(data);
      updateProgressTracking(data);
      checkForNewFinishers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProgressTracking = (data) => {
    const newHighestProgress = { ...highestProgress };
    data.forEach(user => {
      const currentProgress = user.test_status.passed / user.test_status.total;
      newHighestProgress[user.id] = Math.max(
        currentProgress,
        highestProgress[user.id] || 0
      );
    });
    setHighestProgress(newHighestProgress);
  };

  const checkForNewFinishers = (data) => {
    const newlyFinished = data
      .filter(user => user.test_status.passed >= user.test_status.total && !finishedCars.includes(user.id))
      .map(user => user.id);
    
    if (newlyFinished.length > 0) {
      setFinishedCars(prev => [...prev, ...newlyFinished]);
    }
  };

  useEffect(() => {
    fetchRaceData();
    const pollInterval = setInterval(fetchRaceData, 5000);
    return () => clearInterval(pollInterval);
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

  const RaceCar = ({ user, index, isLeader }) => {
    const progress = user.test_status.passed / user.test_status.total;
    const trackWidth = trackWidths[index] || 0;
    const xPos = progress * (trackWidth - 60);
    const isFinished = user.test_status.passed >= user.test_status.total;

    return (
      <motion.div
        className={`race-car ${isLeader ? 'leader' : ''} ${isFinished ? 'finished' : ''}`}
        animate={{
          x: xPos,
          scale: isFinished ? 1.1 : 1,
        }}
        transition={{
          x: { type: "spring", stiffness: 50, damping: 20 },
          scale: { duration: 0.3 }
        }}
      >
        <div className="car-effects">
          <div className="light-trail" />
          <div className="speed-lines" />
          {isLeader && <div className="crown">👑</div>}
        </div>
        <img 
          src={`/cars/car${(index % 4) + 1}.png`}
          alt="racing car"
          className="car-image"
        />
        {progress > 0 && <div className="progress-glow" />}
      </motion.div>
    );
  };

  return (
    <div className="race-track-container">
      <div className="race-header">
        <h1 className="race-title">
          Car Race Visualization
          <span className="checkered-flag">🏁</span>
        </h1>
        <div className="race-controls">
          <select 
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="project-selector"
          >
            {uniqueProjects.map(project => (
              <option key={project} value={project}>{project}</option>
            ))}
          </select>
          <button 
            onClick={fetchRaceData}
            className="refresh-button"
            disabled={isLoading}
          >
            {isLoading ? '⌛' : '🔄'} Refresh
          </button>
        </div>
      </div>

      <div className="race-tracks">
        <div className="track-markers">
          <div className="start-line">
            <span className="flag">🚦</span>
            <span className="label">Start</span>
          </div>
          <div className="finish-line">
            <span className="flag">🏁</span>
            <span className="label">Finish</span>
          </div>
        </div>

        {filteredUsers.map((user, index) => (
          <div key={user.id} className="race-lane">
            <div className="player-info">
              <h3 className="player-name">{user.user}</h3>
              <p className="project-name">{user.project_info.name}</p>
            </div>

            <div className="track" ref={el => trackRefs.current[index] = el}>
              <RaceCar 
                user={user}
                index={index}
                isLeader={user.id === leader?.id}
              />
            </div>

            <div className="progress-info">
              <span className="test-count">
                {user.test_status.passed} / {user.test_status.total} tests passed
              </span>
              {user.test_status.passed >= user.test_status.total && (
                <span className="finished-badge">🎉 Finished!</span>
              )}
            </div>
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

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};

export default RaceTrack;