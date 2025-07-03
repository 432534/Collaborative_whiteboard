import React, { useState, useEffect } from 'react';
import DrawingCanvas from './DrawingCanvas';
import Toolbar from './Toolbar';
import UserCursors from './UserCursors';
const Whiteboard = ({ socket, roomId, onLeaveRoom }) => {
  const [userCount, setUserCount] = useState(0);
  const [cursors, setCursors] = useState({});
  const [drawingSettings, setDrawingSettings] = useState({
    color: '#000000',
    strokeWidth: 2
  });
  useEffect(() => {
    if (!socket) return;
    socket.on('user-count', (count) => {
      setUserCount(count);
    });
    socket.on('cursor-move', (data) => {
      setCursors(prev => ({
        ...prev,
        [data.userId]: { x: data.x, y: data.y }
      }));
    });
    socket.on('cursor-remove', (userId) => {
      setCursors(prev => {
        const newCursors = { ...prev };
        delete newCursors[userId];
        return newCursors;
      });
    });
    return () => {
      socket.off('user-count');
      socket.off('cursor-move');
      socket.off('cursor-remove');
    };
  }, [socket]);
  const handleMouseMove = (e) => {
    if (!socket) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    socket.emit('cursor-move', { x, y });
  };
  const handleClearCanvas = () => {
    if (socket) {
      socket.emit('clear-canvas');
    }
  };
  return (
    <div className="whiteboard">
      <div className="whiteboard-header">
        <div className="room-info">
          <span className="room-id">Room: {roomId}</span>
          <span className="user-count">👥 {userCount} users</span>
        </div>
        <button onClick={onLeaveRoom} className="leave-btn">
          Leave Room
        </button>
      </div>
      <Toolbar 
        drawingSettings={drawingSettings}
        onSettingsChange={setDrawingSettings}
        onClearCanvas={handleClearCanvas}
      />
      <div className="canvas-container" onMouseMove={handleMouseMove}>
        <DrawingCanvas 
          socket={socket}
          drawingSettings={drawingSettings}
        />
        <UserCursors cursors={cursors} />
      </div>
    </div>
  );
};

export default Whiteboard;