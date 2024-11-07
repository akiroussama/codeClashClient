import './UserCard.css';
import { motion } from 'framer-motion';

const UserCard = ({ username, score, total, percentage, style }) => {
  const initial = username && typeof username === 'string' ? username[0].toUpperCase() : '?';
  return (
    <div className="user-card" >
      <div className="avatar" style={style}>
        {initial}
      </div>
      <div className="user-info">
        <div className="username">
          {username || 'Unknown User'}
          <span className="crown-icon">👑</span>
        </div>
        <div className="stats">
          <span>{score}/{total}</span>
          <span className="percentage">({percentage}%)</span>
        </div>
      </div>
    </div>
  );
} 

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

export default UserCard;