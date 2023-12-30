import React, { useState, useEffect, useRef } from 'react';
import DragBehavior from './DragBehavior';

function drawKnob(ctx, width, height, value, min, max, log, meterColor, knobColor, thumbColor) {
  // Clear the canvas
  ctx.clearRect(0, 0, width, height);
  // Calculate the knob value
  const knobValue = log ? Math.log(value / min) / Math.log(max / min) : (value - min) / (max - min);

  // Draw the knob
  const hw = width * 0.5;
  const hh = height * 0.5;
  const radius = Math.min(hw, hh) * 0.8;

  // Fill
  ctx.strokeStyle = meterColor;
  ctx.lineWidth = Math.round(width * 0.028);
  ctx.lineCap = 'round';

  const fillStart = 0.75 * Math.PI;
  const fillEnd = fillStart + (1.5 * knobValue * Math.PI);

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

function Knob({ name, min, max, onChange, value, log, precision, meterColor, knobColor, thumbColor }) {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    drawKnob(ctx, canvas.width, canvas.height, value, min, max, log, precision, meterColor, knobColor, thumbColor);
  }, [value, min, max, log, precision, meterColor, knobColor, thumbColor]);



  const handleChange = (newValue) => {
    console.log('handleChange', newValue);
    let finalValue;
    if (log) {
      finalValue = min * Math.pow(max / min, newValue);
    } else {
      finalValue = newValue * (max - min) + min;
    }
    finalValue = Math.round(finalValue / precision) * precision;
    onChange && onChange(finalValue);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    drawKnob(ctx, canvas.width, canvas.height, value, min, max, log, meterColor, knobColor, thumbColor);
  }, [value, min, max, log, precision, meterColor, knobColor, thumbColor]);

  return (
    <DragBehavior onChange={handleChange} >
      <div id='knob-container' >
        <canvas ref={canvasRef} width="60" height="60" />
        <div id='knob-name'>{name}</div>
      </div>
    </DragBehavior>
  );
}

export default React.memo(Knob);
