import { svelte } from '@sveltejs/vite-plugin-svelte';
import preprocess from 'svelte-preprocess';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [svelte({ preprocess: [preprocess()] })],

    server: {
        port: 8000,
    },
});
