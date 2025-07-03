import React, { useState } from 'react';
import axios from 'axios';
const RoomJoin = ({ onJoinRoom }) => {
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const generateRoomCode = () => {
    const code = Math.random().toString(36).substr(2, 7).toUpperCase();
    setRoomCode(code);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomCode.trim()) return;
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/rooms/join', {
        roomId: roomCode.trim().toUpperCase()
      });
      
      if (response.data.success) {
        onJoinRoom(response.data.roomId);
      }
    } catch (error) {
      console.error('Error joining room:', error);
      alert('Failed to join room. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="room-join">
      <div className="room-join-card">
        <h2>Join a Whiteboard Room</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="Enter room code"
              maxLength={8}
              className="room-input"
              disabled={loading}
            />
            <button
              type="button"
              onClick={generateRoomCode}
              className="generate-btn"
              disabled={loading}
            >
              Generate
            </button>
          </div>
          <button 
            type="submit" 
            className="join-btn"
            disabled={!roomCode.trim() || loading}
          >
            {loading ? 'Joining...' : 'Join Room'}
          </button>
        </form>
        <p className="room-info">
          Enter an existing room code or generate a new one to start collaborating!
        </p>
      </div>
    </div>
  );
};

export default RoomJoin;