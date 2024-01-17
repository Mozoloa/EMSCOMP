import React, { useState, useEffect, useRef } from 'react';

function DecibelMeter({ event, invert, decay }) {
    const [meterValue, setMeterValue] = useState(0); // Current meter value
    const [overload, setOverload] = useState(false); // Overload state
    const prevValueRef = useRef(0); // Ref to store previous meter value
    decay = decay || 0;

    useEffect(() => {
        if (!event?.event) {
            console.log('No event received');
            return;
        }

        let max = event.event.max;
        let isOverloaded = false;
        if (max > 1) {
            max = 1;
            isOverloaded = true;
        }

        const logMax = Math.max(20 * Math.log10(max), -60);
        let normalizedMax = (logMax + 60) / 60;
        if (invert) {
            normalizedMax = 1 - normalizedMax;
        }


        if (normalizedMax < prevValueRef.current && decay > 0) {
            // Apply decay
            const decayedValue = prevValueRef.current * decay;
            console.log('Applying decay to meter value', prevValueRef.current, decayedValue, decay);
            setMeterValue(decayedValue);
        } else {
            setMeterValue(normalizedMax);
        }

        setOverload(isOverloaded);
        prevValueRef.current = normalizedMax;
    }, [event]);


    const roundedMax = Math.round(meterValue * 1000) / 10;

    const meterStyle = {
        height: `${roundedMax}%`,
        bottom: invert ? 'auto' : '0'
    };

    const overlayClass = invert ? 'gr' : 'signal';
    const overloadClass = overload ? 'overload' : 'overload-safe';

    return (
        <div id='meter-container'>
            <div id='meter-value' style={meterStyle}></div>
            <div id='meter-overlay' className={overlayClass}></div>
            <div id='meter-overload' className={overloadClass}></div>
        </div>
    );
}

export default React.memo(DecibelMeter);
