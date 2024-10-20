import { codeToHtml } from 'shiki';
import dedent from 'dedent';

async function highlight(code: string) {
    return await codeToHtml(code, {
        lang: 'svelte',
        theme: 'nord',
    });
}

export async function load() {
    return {
        code: await highlight(dedent`
            <script>
                import { Hamburger } from 'svelte-hamburgers';
            </script>

            <Hamburger type="__type__" />

            <!--
                Hamburger components for Svelte,
                with 31 different types available,
                based on hamburgers.css by Jonathan Suh.
            -->
        `),
    };
}
