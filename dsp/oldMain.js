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

  let bands = [];

  function processFilterBands(type, freq, order) {
    const filterFreq = el.sm(el.const({ key: `${type}_freq`, value: freq }));
    const filterOrder = parseInt(order);
    for (let i = 0; i < filterOrder; i++) {
      bands.push({ type, freq: filterFreq, q: 0.707 });
    }
  }
  // Process high-pass filter bands
  processFilterBands(el.highpass, state.hpf_freq, state.hpf_order);

  // Process low-pass filter bands
  processFilterBands(el.lowpass, state.lpf_freq, state.lpf_order);

  Object.keys(state).forEach(key => {
    if (key.startsWith("peak") && key.endsWith("_freq")) {
      const bandNumber = key.split("_")[0].replace("peak", ""); // Extracts the band number, e.g., "1" from "peak1_freq"
      const freqKey = `peak${bandNumber}_freq`;
      const qKey = `peak${bandNumber}_q`;
      const gainKey = `peak${bandNumber}_gain`;

      const freq = el.sm(el.const({ key: freqKey, value: state[freqKey] }));
      const q = el.sm(el.const({ key: qKey, value: state[qKey] }));
      const gain = el.sm(el.const({ key: gainKey, value: state[gainKey] }));

      bands.push({ type: el.peak, freq, q, gain });
    }
  });

  // Process low-shelf & highshelf filter bands
  function processShelfBands(type, freq, gain, q) {
    const filterFreq = el.sm(el.const({ key: `${type}_freq`, value: freq }));
    const filterGain = el.sm(el.const({ key: `${type}_gain`, value: gain }));
    bands.push({ type, freq: filterFreq, q: q, gain: filterGain });
  }

  processShelfBands(el.lowshelf, state.lowshelf_freq, state.lowshelf_gain, state.lowshelf_q);
  processShelfBands(el.highshelf, state.highshelf_freq, state.highshelf_gain, state.highshelf_q);



  const output = eq(bands, input);
  const meteredOutput = el.meter({ name: output }, output);
  core.render(meteredOutput, meteredOutput);
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