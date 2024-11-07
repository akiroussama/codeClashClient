import './UserCard.css';

const UserCard = ({ username, score, total, percentage, style }) => {
  // Ensure username is a string and not empty
  const initial = username && typeof username === 'string' ? username[0].toUpperCase() : '?';
  console.log("style", style);
  return (
    <div className="user-card">
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

export default UserCard;