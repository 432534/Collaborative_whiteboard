import React from 'react';

const UserCursors = ({ cursors }) => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];

  return (
    <div className="user-cursors">
      {Object.entries(cursors).map(([userId, position], index) => (
        <div
          key={userId}
          className="cursor"
          style={{
            left: position.x,
            top: position.y,
            backgroundColor: colors[index % colors.length]
          }}
        />
      ))}
    </div>
  );
};

export default UserCursors;