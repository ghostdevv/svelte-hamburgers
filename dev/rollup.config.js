import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import preprocess from 'svelte-preprocess';
import svelte from 'rollup-plugin-svelte';

export default {
    input: 'src/main.js',
    output: {
        format: 'iife',
        name: 'app',
        file: 'bundle.js',
    },
    plugins: [
        svelte({ preprocess: [preprocess()], emitCss: false }),
        resolve({ browser: true, dedupe: ['svelte'] }),
        commonjs(),
    ],
};
