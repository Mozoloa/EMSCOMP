import React from 'react';

function Knob({ min, max, onChange, value, log, precision }) {
  // Function to handle logarithmic conversion
  const logValue = (linearValue) => {
    return min * Math.pow(max / min, linearValue);
  }

  // Function to handle inverse logarithmic conversion
  const linearValue = (logValue) => {
    return Math.log(logValue / min) / Math.log(max / min);
  }

  const handleChange = (event) => {
    const linearVal = parseFloat(event.target.value);
    let finalValue = log ? logValue(linearVal) : linearVal * (max - min) + min;

    // Apply precision
    finalValue = Math.round(finalValue / precision) * precision;

    onChange && onChange(finalValue);
  };

  // Determine the current value for the slider
  const sliderValue = log ? linearValue(value) : (value - min) / (max - min);

  return (
    <input
      type="range"
      min="0"
      max="1"
      step="any"
      value={sliderValue}
      onChange={handleChange}
      style={{
        width: '80px',
        height: '10px',
        cursor: 'pointer',
      }}
    />
  );
}

export default Knob;
