import React, { useEffect, useRef } from 'react';
import DragBehavior from './DragBehavior';

function drawKnob(ctx, width, height, value, meterColor, knobColor, thumbColor) {
  // Clear the canvas
  ctx.clearRect(0, 0, width, height);

  // Draw the knob
  const hw = width * 0.5;
  const hh = height * 0.5;
  const radius = Math.min(hw, hh) * 0.8;

  // Fill
  ctx.strokeStyle = meterColor;
  ctx.lineWidth = Math.round(width * 0.028);
  ctx.lineCap = 'round';

  const fillStart = 0.75 * Math.PI;
  const fillEnd = fillStart + (1.5 * value * Math.PI);

  ctx.beginPath();
  ctx.arc(hw, hh, radius, fillStart, fillEnd, false);
  ctx.stroke();

  // Knob
  ctx.strokeStyle = knobColor;
  ctx.lineWidth = Math.round(width * 0.028);
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.arc(hw, hh, radius * 0.72, 0, 2 * Math.PI, false);
  ctx.stroke();

  // Knob thumb
  ctx.fillStyle = thumbColor;
  ctx.lineWidth = Math.round(width * 0.036);
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.arc(hw + 0.5 * radius * Math.cos(fillEnd), hh + 0.5 * radius * Math.sin(fillEnd), radius * 0.08, 0, 2 * Math.PI, false);
  ctx.fill();
}

function Knob({ name, paramId, onChange, value, meterColor, knobColor, thumbColor }) {
  const canvasRef = useRef();
  const handleChange = (newValue) => {
    if (onChange) {
      onChange(newValue);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    drawKnob(ctx, canvas.width, canvas.height, value, meterColor, knobColor, thumbColor);
  }, [value, meterColor, knobColor, thumbColor]);
  return (
    <DragBehavior onChange={handleChange} value={value} name={paramId}>
      <div id='knob-container' >
        <canvas ref={canvasRef} width="60" height="60" />
        <div id='knob-name'>{name}</div>
      </div>
    </DragBehavior>
  );
}

export default React.memo(Knob);
