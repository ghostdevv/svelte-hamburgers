import resolve from 'rollup-plugin-node-resolve';
import preprocess from 'svelte-preprocess';
import svelte from 'rollup-plugin-svelte';
import pkg from './package.json';

export default {
    input: pkg.svelte,
    output: [
        { file: pkg.module, format: 'es' },
        { file: pkg.main, format: 'umd', name: 'Hamburgers' },
    ],
    plugins: [
        svelte({ preprocess: [preprocess()], emitCss: false }),
        resolve(),
    ],
};
