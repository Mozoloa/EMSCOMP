import { el } from '@elemaudio/core';

function eqSignal(bands, xn) {
    return bands.reduce((acc, band) => {
        let args = [band.freq, band.q];

        if (band.hasOwnProperty('gain'))
            args.push(band.gain);

        return band.type.call(null, ...args, acc);
    }, xn);
}

export default function eq(props, left, right) {
    let bands = [];

    function processFilterBands(type, freq, order) {
        const filterFreq = el.sm(el.const({ key: `${type}_freq`, value: freq }));
        const filterOrder = parseInt(order);
        for (let i = 0; i < filterOrder; i++) {
            bands.push({ type, freq: filterFreq, q: 0.707 });
        }
    }
    // Process high-pass filter bands
    processFilterBands(el.highpass, props.hpf_freq, props.hpf_order);

    // Process low-pass filter bands
    processFilterBands(el.lowpass, props.lpf_freq, props.lpf_order);

    Object.keys(props).forEach(key => {
        if (key.startsWith("peak") && key.endsWith("_freq")) {
            const bandNumber = key.split("_")[0].replace("peak", ""); // Extracts the band number, e.g., "1" from "peak1_freq"
            const freqKey = `peak${bandNumber}_freq`;
            const qKey = `peak${bandNumber}_q`;
            const gainKey = `peak${bandNumber}_gain`;

            const freq = el.sm(el.const({ key: freqKey, value: props[freqKey] }));
            const q = el.sm(el.const({ key: qKey, value: props[qKey] }));
            const gain = el.sm(el.const({ key: gainKey, value: props[gainKey] }));

            bands.push({ type: el.peak, freq, q, gain });
        }
    });

    // Process low-shelf & highshelf filter bands
    function processShelfBands(type, freq, gain, q) {
        const filterFreq = el.sm(el.const({ key: `${type}_freq`, value: freq }));
        const filterGain = el.sm(el.const({ key: `${type}_gain`, value: gain }));
        bands.push({ type, freq: filterFreq, q: q, gain: filterGain });
    }

    processShelfBands(el.lowshelf, props.lowshelf_freq, props.lowshelf_gain, props.lowshelf_q);
    processShelfBands(el.highshelf, props.highshelf_freq, props.highshelf_gain, props.highshelf_q);

    const output = eqSignal(bands, left, right);

    return [
        output,
        output
    ]

}