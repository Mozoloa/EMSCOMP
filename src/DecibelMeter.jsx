import React, { useEffect, useRef } from 'react';

function DecibelMeter({ event, invert }) {
    let roundedMax = null; // Initialize the variable at a higher scope
    let overload = false;
    if (!event?.event) {
        console.log('no event');
    } else {
        const meterName = event.event.source;
        let max = event.event.max;
        if (max > 1) {
            max = 1;
            overload = true;
        }
        // Turn the max into dbfs
        const logMax = Math.max(20 * Math.log10(max), -60);
        // Normalize the dbfs to be between 0 and 1
        let normalizedMax = (logMax + 60) / 60;
        if (invert) {
            normalizedMax = 1 - normalizedMax;
        }
        // Round to 1 decimal place
        roundedMax = Math.round(normalizedMax * 1000) / 10;
        /*console.log(meterName, "dbfs:", logMax, `${roundedMax}%`, max, "overload", overload);*/
    }

    useEffect(() => {
        // Your effect logic here
    }, [event]);

    // Define style object for meter
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