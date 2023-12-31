import { Renderer, el } from '@elemaudio/core';
import { RefMap } from './RefMap';
import eq from './eq';


let core = new Renderer((batch) => {
  __postNativeMessage__(JSON.stringify(batch));
});

const refs = new RefMap(core);

let prevState = null;

function shouldRender(prevState, nextState) {
  return (prevState === null) || (prevState.sampleRate !== nextState.sampleRate);
}

const left = el.in({ channel: 0 });
const right = el.in({ channel: 1 });

globalThis.__receiveStateChange__ = (serializedState) => {
  const state = JSON.parse(serializedState);

  if (shouldRender(prevState, state)) {
    let stats = core.render(eq({
      key: 'eq',
      sampleRate: state.sampleRate,
      hpf_freq: refs.getOrCreate("hpf_freq", "const", { value: state.hpf_freq }, []),
      hpf_order: refs.getOrCreate("hpf_order", "const", { value: state.hpf_order }, []),
      lpf_freq: refs.getOrCreate("lpf_freq", "const", { value: state.lpf_freq }, []),
      lpf_order: refs.getOrCreate("lpf_order", "const", { value: state.lpf_order }, []),
      lowshelf_freq: refs.getOrCreate("lowshelf_freq", "const", { value: state.lowshelf_freq }, []),
      lowshelf_gain: refs.getOrCreate("lowshelf_gain", "const", { value: state.lowshelf_gain }, []),
      lowshelf_q: refs.getOrCreate("lowshelf_q", "const", { value: state.lowshelf_q }, []),
      highshelf_freq: refs.getOrCreate("highshelf_freq", "const", { value: state.highshelf_freq }, []),
      highshelf_gain: refs.getOrCreate("highshelf_gain", "const", { value: state.highshelf_gain }, []),
      highshelf_q: refs.getOrCreate("highshelf_q", "const", { value: state.highshelf_q }, []),
      peak1_freq: refs.getOrCreate("peak1_freq", "const", { value: state.peak1_freq }, []),
      peak1_q: refs.getOrCreate("peak1_q", "const", { value: state.peak1_q }, []),
      peak1_gain: refs.getOrCreate("peak1_gain", "const", { value: state.peak1_gain }, []),
      peak2_freq: refs.getOrCreate("peak2_freq", "const", { value: state.peak2_freq }, []),
      peak2_q: refs.getOrCreate("peak2_q", "const", { value: state.peak2_q }, []),
      peak2_gain: refs.getOrCreate("peak2_gain", "const", { value: state.peak2_gain }, []),
      peak3_freq: refs.getOrCreate("peak3_freq", "const", { value: state.peak3_freq }, []),
      peak3_q: refs.getOrCreate("peak3_q", "const", { value: state.peak3_q }, []),
      peak3_gain: refs.getOrCreate("peak3_gain", "const", { value: state.peak3_gain }, []),
    }, left, right));
    console.log("Render restarted with stats: ", stats);
  } else {
    refs.update("hpf_freq", { value: state.hpf_freq });
    refs.update("hpf_order", { value: state.hpf_order });
    refs.update("lpf_freq", { value: state.lpf_freq });
    refs.update("lpf_order", { value: state.lpf_order });
    refs.update("lowshelf_freq", { value: state.lowshelf_freq });
    refs.update("lowshelf_gain", { value: state.lowshelf_gain });
    refs.update("lowshelf_q", { value: state.lowshelf_q });
    refs.update("highshelf_freq", { value: state.highshelf_freq });
    refs.update("highshelf_gain", { value: state.highshelf_gain });
    refs.update("highshelf_q", { value: state.highshelf_q });
    refs.update("peak1_freq", { value: state.peak1_freq });
    refs.update("peak1_q", { value: state.peak1_q });
    refs.update("peak1_gain", { value: state.peak1_gain });
    refs.update("peak2_freq", { value: state.peak2_freq });
    refs.update("peak2_q", { value: state.peak2_q });
    refs.update("peak2_gain", { value: state.peak2_gain });
    refs.update("peak3_freq", { value: state.peak3_freq });
    refs.update("peak3_q", { value: state.peak3_q });
    refs.update("peak3_gain", { value: state.peak3_gain });
  };
}

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