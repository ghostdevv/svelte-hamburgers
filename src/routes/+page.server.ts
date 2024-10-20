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
        examples: {
            gettingStarted: await highlight(dedent`
                <script>
                    import { Hamburger } from 'svelte-hamburgers';
                </script>

                <Hamburger />
            `),
            openProp: await highlight(dedent`
                <script>
                    import { Hamburger } from 'svelte-hamburgers';

                    let open = $state(false);
                </script>

                <Hamburger bind:open />

                <p>Hamburger open: {open}</p>
            `),
            type: await highlight(dedent`
                <script>
                    import { Hamburger } from 'svelte-hamburgers';
                </script>

                <Hamburger type="elastic" />
            `),
            title: await highlight(dedent`
                <script>
                    import { Hamburger } from 'svelte-hamburgers';
                </script>

                <Hamburger title="Toggles the cat picture" />
            `),
            style: await highlight(dedent`
                <script>
                    import { Hamburger } from 'svelte-hamburgers';
                </script>

                <Hamburger --color="red" />
            `),
            fullExample: await highlight(dedent`
                <script>
                    import Hamburger from '$lib/Hamburger.svelte';
                    import { fly } from 'svelte/transition';

                    let open = $state(false);
                </script>

                <nav>
                    <Hamburger
                        bind:open
                        type="collapse"
                        title="Toggle nav links"
                        ariaControls="nav"
                    />

                    {#if open}
                        <ul id="nav" class="menu" transition:fly={{ y: -15 }}>
                            <li><a href="#">Home</a></li>
                            <li><a href="#">About</a></li>
                            <li><a href="#">Contact</a></li>
                        </ul>
                    {/if}
                </nav>
            `),
        },
    };
}
