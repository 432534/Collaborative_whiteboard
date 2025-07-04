import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import RoomJoin from './components/RoomJoin';
import WhiteBoard from './components/WhiteBoard';
import './App.css';
function App() {
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const handleJoinRoom = (room) => {
    setRoomId(room);
    if (socket) {
      socket.emit('join-room', room);
    }
  };

  const handleLeaveRoom = () => {
    setRoomId('');
    if (socket) {
      socket.emit('leave-room');
    }
  };
  return (
    <div className="App">
      <header className="App-header">
        <h1>Collaborative Whiteboard</h1>
        <div className="connection-status">
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
      </header>
      
      {!roomId ? (
        <RoomJoin onJoinRoom={handleJoinRoom} />
      ) : (
        <WhiteBoard 
          socket={socket} 
          roomId={roomId} 
          onLeaveRoom={handleLeaveRoom}
        />
      )}
    </div>
  );
}
export default App;