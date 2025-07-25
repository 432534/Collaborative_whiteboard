const Room = require('../models/Room');
const rooms = new Map();

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', async (roomId) => {
      try {
        socket.join(roomId);
        socket.roomId = roomId;

        if (!rooms.has(roomId)) {
          rooms.set(roomId, new Set());
        }
        rooms.get(roomId).add(socket.id);

        const userCount = rooms.get(roomId).size;
        io.to(roomId).emit('user-count', userCount);

        const room = await Room.findOne({ roomId });
        if (room && room.drawingData) {
          // Send to frontend if you ever want to load via socket
          // But you’re already using REST API to pass this
          // socket.emit('load-canvas', room.drawingData); ❌ Not used — safe to remove
        }

        console.log(`User ${socket.id} joined room ${roomId}`);
      } catch (error) {
        console.error('Error joining room:', error);
      }
    });

    socket.on('cursor-move', (data) => {
      if (socket.roomId) {
        socket.to(socket.roomId).emit('cursor-move', {
          userId: socket.id,
          x: data.x,
          y: data.y
        });
      }
    });

    // ✅ Handle and store each draw action individually
    const saveDrawingCommand = async (type, data) => {
      try {
        await Room.findOneAndUpdate(
          { roomId: socket.roomId },
          {
            $push: {
              drawingData: {
                type,
                data,
                timestamp: new Date()
              }
            },
            lastActivity: new Date()
          },
          { upsert: true }
        );
      } catch (error) {
        console.error(`Error saving ${type}:`, error);
      }
    };

    socket.on('draw-start', (data) => {
      if (socket.roomId) {
        socket.to(socket.roomId).emit('draw-start', data);
        saveDrawingCommand('draw-start', data);
      }
    });

    socket.on('draw-move', (data) => {
      if (socket.roomId) {
        socket.to(socket.roomId).emit('draw-move', data);
        saveDrawingCommand('draw-move', data);
      }
    });

    socket.on('draw-end', (data) => {
      if (socket.roomId) {
        socket.to(socket.roomId).emit('draw-end', data);
        saveDrawingCommand('draw-end', data);
      }
    });

    socket.on('clear-canvas', async () => {
      if (socket.roomId) {
        io.to(socket.roomId).emit('clear-canvas');
        try {
          await Room.findOneAndUpdate(
            { roomId: socket.roomId },
            {
              drawingData: [],
              lastActivity: new Date()
            }
          );
        } catch (error) {
          console.error('Error clearing canvas data:', error);
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);

      if (socket.roomId && rooms.has(socket.roomId)) {
        rooms.get(socket.roomId).delete(socket.id);

        const userCount = rooms.get(socket.roomId).size;
        if (userCount === 0) {
          rooms.delete(socket.roomId);
        } else {
          io.to(socket.roomId).emit('user-count', userCount);
        }

        socket.to(socket.roomId).emit('cursor-remove', socket.id);
      }
    });
  });
};
