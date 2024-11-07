import './UserCard.css';

const UserCard = ({ username, score, total, percentage }) => {
  return (
    <div className="user-card">
      <div className="avatar">
        {username[0].toUpperCase()}
      </div>
      <div className="user-info">
        <div className="username">
          {username}
          <span className="crown-icon">👑</span>
        </div>
        <div className="stats">
          <span>{score}/{total}</span>
          <span className="percentage">({percentage}%)</span>
        </div>
      </div>
    </div>
    )
} 

export default UserCard;