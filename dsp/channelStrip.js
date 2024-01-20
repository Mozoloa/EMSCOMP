import invariant from 'invariant';
import { el } from '@elemaudio/core';
import expand from './expand';
import comp from './comp';

export default function channelStrip(props, left, right) {
    invariant(typeof props === 'object', 'Unexpected props object');

    const input = {
        left: el.meter({ name: "main_inputL" }, left),
        right: el.meter({ name: "main_inputR" }, right)
    }
    /*     const expand = expand(props, left, right); */
    const output = comp(props, input.left, input.right);
    return {
        left: el.meter({ name: "main_outputL" }, output.left),
        right: el.meter({ name: "main_outputR" }, output.right)
    }
}