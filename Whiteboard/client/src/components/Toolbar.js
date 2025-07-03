import React from 'react';

const Toolbar = ({ drawingSettings, onSettingsChange, onClearCanvas }) => {
  const colors = ['#000000', '#FF0000', '#0000FF', '#00FF00'];

  const handleColorChange = (color) => {
    onSettingsChange(prev => ({ ...prev, color }));
  };

  const handleStrokeWidthChange = (e) => {
    onSettingsChange(prev => ({ ...prev, strokeWidth: parseInt(e.target.value) }));
  };

  return (
    <div className="toolbar">
      <div className="tool-group">
        <label>Colors:</label>
        <div className="color-options">
          {colors.map(color => (
            <button
              key={color}
              className={`color-btn ${drawingSettings.color === color ? 'active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => handleColorChange(color)}
            />
          ))}
        </div>
      </div>
      
      <div className="tool-group">
        <label>Stroke Width:</label>
        <input
          type="range"
          min="1"
          max="10"
          value={drawingSettings.strokeWidth}
          onChange={handleStrokeWidthChange}
          className="stroke-slider"
        />
        <span className="stroke-value">{drawingSettings.strokeWidth}px</span>
      </div>
      
      <button onClick={onClearCanvas} className="clear-btn">
        Clear Canvas
      </button>
    </div>
  );
};

export default Toolbar;