import invariant from 'invariant';
import { el } from '@elemaudio/core';

function compress(atkMs, relMs, threshold, ratio, kneeWidth, sidechain, xn) {
    const env = el.env(
        el.tau2pole(el.mul(0.001, atkMs)),
        el.tau2pole(el.mul(0.001, relMs)),
        sidechain,
    );

    const envDecibels = el.gain2db(env);

    // Calculate the soft knee bounds around the threshold
    const lowerKneeBound = el.sub(threshold, el.div(kneeWidth, 2)); // threshold - kneeWidth/2
    const upperKneeBound = el.add(threshold, el.div(kneeWidth, 2)); // threshold + kneeWidth/2

    // Check if the envelope is in the soft knee range
    const isInSoftKneeRange = el.and(
        el.geq(envDecibels, lowerKneeBound), // envDecibels >= lowerKneeBound
        el.leq(envDecibels, upperKneeBound), // envDecibels <= upperKneeBound
    );

    // Calculate gain multiplier from the ratio (1 - 1/ratio)
    const adjustedRatio = el.sub(1, el.div(1, ratio));

    /* Gain calculation
    * When in soft knee range, do : 
    * 0.5 * adjustedRatio * ((envDecibels - lowerKneeBound) / kneeWidth) * (lowerKneeBound - envDecibels)
    * Else do :
    * adjustedRatio * (threshold - envDecibels)
    */
    const gain = el.select(
        isInSoftKneeRange,
        el.mul(
            el.div(adjustedRatio, 2),
            el.mul(
                el.div(el.sub(envDecibels, lowerKneeBound), kneeWidth),
                el.sub(lowerKneeBound, envDecibels)
            )
        ),
        el.mul(
            adjustedRatio,
            el.sub(threshold, envDecibels)
        )
    );

    // Ensuring gain is not positive
    const cleanGain = el.min(0, gain);

    // Convert the gain reduction in dB to a gain factor
    const compressedGain = el.db2gain(cleanGain);

    return el.mul(xn, compressedGain);
}


function eqSignal(bands, xn) {
    return bands.reduce((acc, band) => {
        let args = [band.freq, band.q];

        if (band.hasOwnProperty('gain'))
            args.push(band.gain);

        return band.type.call(null, ...args, acc);
    }, xn);
}

export default function comp(props, left, right) {
    invariant(typeof props === 'object', 'Unexpected props object');

    // Sidechain
    const sc_hpf = el.sm(props.env_hpf_freq);

    const bands = [
        { type: el.highpass, freq: sc_hpf, q: 0.707 },
    ]

    const filteredSidechain = eqSignal(bands, left);
    const threshold = el.sm(props.comp_threshold);
    const ratio = el.sm(props.comp_ratio);
    const kneeWidth = el.sm(props.comp_knee);
    const atkMs = el.sm(props.env_atk);
    const relMs = el.sm(props.env_rel);
    const out_gain = el.sm(props.out_gain);
    const mix = el.sm(props.out_mix);
    const compL = compress(atkMs, relMs, threshold, ratio, kneeWidth, filteredSidechain, left);
    const compR = compress(atkMs, relMs, threshold, ratio, kneeWidth, filteredSidechain, right);
    const outputL = el.mul(el.db2gain(out_gain), compL);
    const outputR = el.mul(el.db2gain(out_gain), compR);
    const mixedOutputL = el.select(mix, outputL, left);
    const mixedOutputR = el.select(mix, outputR, right)
    // Wet dry mixing
    return [
        mixedOutputL,
        mixedOutputR,
    ];
}
