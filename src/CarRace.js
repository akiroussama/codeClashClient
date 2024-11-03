import React, { useEffect, useState } from 'react';
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

  // Calculate the finish line position accounting for car width
  const CAR_WIDTH = 50; // Width of car in pixels
  const TRACK_PADDING = 20; // Padding from CSS

  return (
    <div className="p-5 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Car Race Visualization</h2>
      <div className="relative py-5">
        {/* Start Line */}
        <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-red-500">
          <span className="absolute -top-6 left-0 whitespace-nowrap text-sm">🚩 Start</span>
        </div>
        {/* Finish Line */}
        <div className="absolute top-0 bottom-0 right-0 w-0.5 bg-green-500">
          <span className="absolute -top-6 right-0 whitespace-nowrap text-sm">🏁 Finish</span>
        </div>
        
        {users.map((user, idx) => {
          const isFinished = user.test_status.passed >= user.test_status.total;
          const progressPercentage = (user.test_status.passed / user.test_status.total) * 100;
          
          // Calculate the actual pixel position for the car
          const trackWidth = document.querySelector('.track')?.clientWidth || 0;
          const maxTranslateX = trackWidth - CAR_WIDTH - (TRACK_PADDING * 2);
          const translateX = (progressPercentage / 100) * maxTranslateX;

          return (
            <div key={user.id} className="flex items-center mb-5 gap-5">
              <div className="w-40 flex flex-col">
                <span className="font-bold mb-1">{user.user}</span>
                <span className="text-sm text-gray-600">{user.project_info.name}</span>
              </div>
              
              <div className="relative flex-grow h-16 bg-gray-100 rounded-lg overflow-hidden track">
                <motion.img
                  src={getCarImage(user.id, idx)}
                  alt={`${user.user} car`}
                  className={`absolute top-1/2 left-0 w-[50px] h-auto 
                    ${user.id === leader?.id ? 'filter drop-shadow-lg shadow-yellow-500' : ''}
                    ${isFinished ? 'filter drop-shadow-lg shadow-green-500' : ''}`}
                  style={{ zIndex: idx + 1 }}
                  animate={{
                    x: isFinished ? maxTranslateX : translateX,
                    y: '-50%',
                    scale: isFinished ? 1.1 : 1,
                  }}
                  transition={{
                    x: { type: 'spring', stiffness: 50, damping: 20 },
                    scale: { duration: 0.3 }
                  }}
                />
              </div>

              <div className="w-40 text-right">
                <span>{user.test_status.passed} / {user.test_status.total} tests passed</span>
                {isFinished && (
                  <span className="ml-2 px-2 py-0.5 bg-green-500 text-white rounded-full text-sm">
                    🎉 Finished
                  </span>
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