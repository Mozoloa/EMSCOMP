import { Renderer, el } from '@elemaudio/core';

let core = new Renderer((batch) => {
  __postNativeMessage__(JSON.stringify(batch));
});

function eq(bands, xn) {
  return bands.reduce((acc, band) => {
    let args = [band.freq, band.q];

    if (band.hasOwnProperty('gain'))
      args.push(band.gain);

    return band.type.call(null, ...args, acc);
  }, xn);
}

const input = el.in({ channel: 0 });

globalThis.__receiveStateChange__ = (serializedState) => {
  const state = JSON.parse(serializedState);

  // Extract sub-parameters for each group
  const hpfFreq = el.sm(el.const({ key: "hpf_freq", value: state.hpf_freq }));
  const hpfOrder = parseInt(state.hpf_order);
  const peakFreq = el.sm(el.const({ key: "peak_freq", value: state.peak_freq }));
  const peakQ = el.sm(el.const({ key: "peak_q", value: state.peak_q }));
  const peakGain = el.sm(el.const({ key: "peak_gain", value: state.peak_gain }));
  const lpfFreq = el.sm(el.const({ key: "lpf_freq", value: state.lpf_freq }));
  const lpfOrder = parseInt(state.lpf_order);

  let bands = [];

  // Add high-pass filter bands
  for (let i = 0; i < hpfOrder; i++) {
    bands.push({ type: el.highpass, freq: hpfFreq, q: 0.7 });
  }

  // Add peak filter band
  bands.push({ type: el.peak, freq: peakFreq, q: peakQ, gain: peakGain });

  // Add low-pass filter bands
  for (let i = 0; i < lpfOrder; i++) {
    bands.push({ type: el.lowpass, freq: lpfFreq, q: 0.7 });
  }

  const output = eq(bands, input);
  core.render(output, output);
};


globalThis.__receiveHydrationData__ = (data) => {
  const payload = JSON.parse(data);
  const nodeMap = core._delegate.nodeMap;

  for (let [k, v] of Object.entries(payload)) {
    nodeMap.set(parseInt(k, 16), {
      symbol: '__ELEM_NODE__',
      kind: '__HYDRATED__',
      hash: parseInt(k, 16),
      props: v,
      generation: {
        current: 0,
      },
    });
  }
};

// Finally, an error callback which just logs back to native
globalThis.__receiveError__ = (err) => {
  console.log(`[Error: ${err.name}] ${err.message}`);
};