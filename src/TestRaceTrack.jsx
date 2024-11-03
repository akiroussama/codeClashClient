// TestRaceTrack.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const RaceTrackContainer = styled.div`
  width: 100%;
  height: 600px;
  background: #1a1a1a;
  position: relative;
  overflow: hidden;
  padding: 20px;
  background-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.8),
    rgba(0, 0, 0, 0.8)
  ), url('/crowd-background.png');
  background-size: cover;
`;

const Track = styled.div`
  width: 100%;
  height: 80px;
  background: #333;
  margin: 10px 0;
  position: relative;
  border-left: 2px solid #444;
  border-right: 2px solid #444;
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    border-top: 2px dashed #444;
  }
`;

const Car = styled.div`
  width: 60px;
  height: 30px;
  position: absolute;
  left: ${props => props.progress}%;
  top: 50%;
  transform: translateY(-50%) rotate(90deg);
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1); // Smoother transition

  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: ${props => props.color};
    clip-path: polygon(0 20%, 50% 0, 100% 20%, 100% 80%, 50% 100%, 0 80%);
    box-shadow: 0 0 10px ${props => props.color}; // Add glow effect
  }

  ${props => props.isMoving && `
    &::after {
      content: '';
      position: absolute;
      bottom: -15px;
      left: 50%;
      transform: translateX(-50%);
      width: 20px;
      height: 30px;
      background: radial-gradient(circle, #ff6b6b, #ffd93d, transparent);
      animation: flame 0.2s infinite alternate;
      opacity: 0.8; // Make flame more visible
    }
  `}
`;

const FinishLine = styled.div`
  width: 40px;
  height: 100%;
  position: absolute;
  right: 0;
  background: repeating-linear-gradient(
    45deg,
    #000,
    #000 10px,
    #fff 10px,
    #fff 20px
  );
`;

const UserInfo = styled.div`
  color: #fff;
  font-size: 14px;
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
`;

const Progress = styled.div`
  color: #fff;
  font-size: 12px;
  position: absolute;
  right: 50px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
`;
const GlobalStyle = createGlobalStyle`
  @keyframes flame {
    0% { transform: scale(1) translateX(-50%); }
    100% { transform: scale(1.2) translateX(-50%); }
  }
`;

const TestRaceTrack = ({ apiEndpoint, refreshInterval = 5000 }) => {
  const [raceData, setRaceData] = useState([]);

  const fetchData = async () => {
    try {
      const response = await axios.get(apiEndpoint);
      setRaceData(response.data);
    } catch (error) {
      console.error('Error fetching race data:', error);
    }
  };

//   useEffect(() => {
//     // Play background music
//     const bgMusic = new Audio('/path/to/background-music.mp3');
//     bgMusic.loop = true;
//     bgMusic.play();

//     return () => {
//       bgMusic.pause();
//       bgMusic.currentTime = 0;
//     };
//   }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [apiEndpoint, refreshInterval]);

  const calculateProgress = (passed, total) => {
    if (total === 0) return 0;
    return (passed / total) * 100;
  };

  const isMoving = (pasCarRace.jssed) => {
    return passed > 0; // Show flame animation if there are any passed tests
  };

  const getCarColor = (index) => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeead'];
    return colors[index % colors.length];
  };

  return (
    <RaceTrackContainer>
      {raceData.map((item, index) => (
        <Track key={item.id}>
          <UserInfo>
            {item.user}
          </UserInfo>
          <Progress>
            {item.test_status.passed}/{item.test_status.totalTests}
          </Progress>
          <Car 
            progress={calculateProgress(
              item.test_status.passed,
              item.test_status.totalTests
            )}
            color={getCarColor(index)}
            isMoving={isMoving(item.test_status.passed)}
          />
          <FinishLine />
        </Track>
      ))}
    </RaceTrackContainer>
  );
};

export default TestRaceTrack;