import React, { useRef, useEffect, useState } from 'react';

const DrawingCanvas = ({ socket, drawingSettings, drawingData }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const ctxRef = useRef(null);

  // Initial canvas setup and socket listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctxRef.current = ctx;

    if (!socket) return;

    socket.on('draw-start', (data) => {
      ctx.beginPath();
      ctx.moveTo(data.x, data.y);
    });

    socket.on('draw-move', (data) => {
      ctx.lineTo(data.x, data.y);
      ctx.strokeStyle = data.color;
      ctx.lineWidth = data.strokeWidth;
      ctx.stroke();
    });

    socket.on('draw-end', () => {
      ctx.closePath();
    });

    socket.on('clear-canvas', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    return () => {
      socket.off('draw-start');
      socket.off('draw-move');
      socket.off('draw-end');
      socket.off('clear-canvas');
    };
  }, [socket]);

  // Replay drawingData on load
  useEffect(() => {
    if (!drawingData || drawingData.length === 0 || !ctxRef.current) return;

    drawingData.forEach((cmd) => {
      const { type, data } = cmd;

      if (type === 'draw-start') {
        ctxRef.current.beginPath();
        ctxRef.current.moveTo(data.x, data.y);
      } else if (type === 'draw-move') {
        ctxRef.current.lineTo(data.x, data.y);
        ctxRef.current.strokeStyle = data.color;
        ctxRef.current.lineWidth = data.strokeWidth;
        ctxRef.current.stroke();
      } else if (type === 'draw-end') {
        ctxRef.current.closePath();
      }
    });
  }, [drawingData]);

  const getMousePos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e) => {
    const pos = getMousePos(e);
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(pos.x, pos.y);
    setIsDrawing(true);

    socket.emit('draw-start', {
      x: pos.x,
      y: pos.y,
      color: drawingSettings.color,
      strokeWidth: drawingSettings.strokeWidth,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const pos = getMousePos(e);
    ctxRef.current.lineTo(pos.x, pos.y);
    ctxRef.current.strokeStyle = drawingSettings.color;
    ctxRef.current.lineWidth = drawingSettings.strokeWidth;
    ctxRef.current.stroke();

    socket.emit('draw-move', {
      x: pos.x,
      y: pos.y,
      color: drawingSettings.color,
      strokeWidth: drawingSettings.strokeWidth,
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    ctxRef.current.closePath();
    setIsDrawing(false);

    socket.emit('draw-end');
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
