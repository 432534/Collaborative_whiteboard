import React, { useRef, useEffect, useState } from 'react';

const DrawingCanvas = ({ socket, drawingSettings }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (!socket) return;

    socket.on('draw', ({ from, to, color, strokeWidth }) => {
      drawLine(ctx, from, to, color, strokeWidth);
    });

    socket.on('clear-canvas', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    return () => {
      socket.off('draw');
      socket.off('clear-canvas');
    };
  }, [socket]);

  const drawLine = (ctx, from, to, color, strokeWidth) => {
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
  };

  const getMousePos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e) => {
    setIsDrawing(true);
    setLastPos(getMousePos(e));
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const newPos = getMousePos(e);
    const ctx = canvasRef.current.getContext('2d');
    drawLine(ctx, lastPos, newPos, drawingSettings.color, drawingSettings.strokeWidth);

    if (socket) {
      socket.emit('draw', {
        from: lastPos,
        to: newPos,
        color: drawingSettings.color,
        strokeWidth: drawingSettings.strokeWidth,
      });
    }
    setLastPos(newPos);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setLastPos(null);
  };

  return (
    <canvas
      ref={canvasRef}
      className="drawing-canvas"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
};

export default DrawingCanvas;
