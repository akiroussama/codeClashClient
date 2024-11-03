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
  transition: left 0.5s ease-out;
  
  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: ${props => props.color};
    clip-path: polygon(0 20%, 50% 0, 100% 20%, 100% 80%, 50% 100%, 0 80%);
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
      background: linear-gradient(to bottom, 
        #ff6b6b,
        #ffd93d,
        transparent
      );
      animation: flame 0.2s infinite alternate;
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

const TestRaceTrack = ({ apiEndpoint, refreshInterval = 5000 }) => {
  const [raceData, setRaceData] = useState([]);
  const [previousData, setPreviousData] = useState({});

  const fetchData = async () => {
    try {
      const response = await axios.get(apiEndpoint);
      setPreviousData(raceData.reduce((acc, item) => ({
        ...acc,
        [item.id]: item.test_status.passed
      }), {}));
      setRaceData(response.data);
    } catch (error) {
      console.error('Error fetching race data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [apiEndpoint, refreshInterval]);

  const calculateProgress = (passed, total) => {
    return (passed / total) * 90; // 90% to leave space for finish line
  };

  const isMoving = (id, passed) => {
    return previousData[id] !== undefined && previousData[id] < passed;
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
            isMoving={isMoving(item.id, item.test_status.passed)}
          />
          <FinishLine />
        </Track>
      ))}
    </RaceTrackContainer>
  );
};

export default TestRaceTrack;