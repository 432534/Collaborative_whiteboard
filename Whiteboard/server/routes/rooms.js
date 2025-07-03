const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
function generateRoomId() {
  return Math.random().toString(36).substr(2, 7).toUpperCase();
}
router.post('/join', async (req, res) => {
  try {
    const { roomId } = req.body;
    
    let room = await Room.findOne({ roomId });
    
    if (!room) {
      room = new Room({ roomId });
      await room.save();
    } else {
      room.lastActivity = new Date();
      await room.save();
    }
    
    res.json({ 
      success: true, 
      roomId: room.roomId,
      drawingData: room.drawingData || []
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router.get('/:roomId', async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    
    res.json({ 
      success: true, 
      room: {
        roomId: room.roomId,
        createdAt: room.createdAt,
        drawingData: room.drawingData || []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
module.exports = router;