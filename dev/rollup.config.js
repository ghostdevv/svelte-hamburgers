import resolve from 'rollup-plugin-node-resolve';
import preprocess from 'svelte-preprocess';
import svelte from 'rollup-plugin-svelte';

export default {
    input: 'index.js',
    output: {
        format: 'iife',
        name: 'app',
        file: 'bundle.js',
    },
    plugins: [
        svelte({ preprocess: [preprocess()], emitCss: false }),
        resolve(),
    ],
};
