import invariant from 'invariant';
import { el } from '@elemaudio/core';


function eqSignal(bands, xn) {
    return bands.reduce((acc, band) => {
        let args = [band.freq, band.q];

        if (band.hasOwnProperty('gain'))
            args.push(band.gain);

        return band.type.call(null, ...args, acc);
    }, xn);
}

export default function eq(props, xl, xr) {
    invariant(typeof props === 'object', 'Unexpected props object');

    const key = props.key;
    const sampleRate = props.sampleRate;
    const hpf_freq = el.sm(props.hpf_freq);
    const lpf_freq = el.sm(props.lpf_freq);
    const lowshelf = {
        freq: el.sm(props.lowshelf_freq),
        gain: el.sm(props.lowshelf_gain),
        q: el.sm(props.lowshelf_q),
    }
    const highshelf = {
        freq: el.sm(props.highshelf_freq),
        gain: el.sm(props.highshelf_gain),
        q: el.sm(props.highshelf_q),
    }
    let bands = [
        { type: el.lowshelf, freq: lowshelf.freq, gain: lowshelf.gain, q: lowshelf.q },
        { type: el.highshelf, freq: highshelf.freq, gain: highshelf.gain, q: highshelf.q },
    ];

    function processFilterBands(type, freq, order) {
        const filterOrder = parseInt(order);
        console.log("Filter order", filterOrder);
        for (let i = 0; i < filterOrder; i++) {
            bands.push({ type, freq: freq, q: 0.707 });
        }
    }
    processFilterBands(el.highpass, hpf_freq, props.hpf_order);
    processFilterBands(el.lowpass, lpf_freq, props.lpf_order);

    Object.keys(props).forEach(key => {
        if (key.startsWith("peak") && key.endsWith("_freq")) {
            const bandNumber = key.split("_")[0].replace("peak", ""); // Extracts the band number, e.g., "1" from "peak1_freq"
            const freqKey = `peak${bandNumber}_freq`;
            const qKey = `peak${bandNumber}_q`;
            const gainKey = `peak${bandNumber}_gain`;

            const freq = el.sm(props[freqKey]);
            const q = el.sm(props[qKey]);
            const gain = el.sm(props[gainKey]);

            bands.push({ type: el.peak, freq, q, gain });
        }
    });

    const output = eqSignal(bands, xl, xr);


    // Wet dry mixing
    return [
        output,
        output,
    ];
}
