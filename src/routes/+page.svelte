<script lang="ts">
    import { Hamburger, HAMBURGER_TYPES } from '$lib';
    import FullExample from './FullExample.svelte';
    import Example from './Example.svelte';
    import GitHub from './GitHub.svelte';

    const { data } = $props();

    let open = $state(false);
</script>

<section class="title">
    <h1>Svelte Hamburgers</h1>

    <a href="https://github.com/ghostdevv/svelte-hamburgers">
        <GitHub size={28} />
    </a>
</section>

<section class="col">
    <h2 id="usage">Usage</h2>

    <p>Get started by putting a hamburger menu on the page</p>

    <Example code={data.examples.gettingStarted}>
        <Hamburger --color="#eee" />
    </Example>

    <p>You can bind to the `open` prop to get it's state</p>

    <Example code={data.examples.openProp}>
        <Hamburger --color="#eee" bind:open />
        <p>Hamburger open: {open}</p>
    </Example>

    <p>You can set your preferred animation <a href="#types">type</a></p>

    <Example code={data.examples.type}>
        <Hamburger --color="#eee" type="elastic" />
    </Example>

    <p>Set the title (and by extension aria-label)</p>

    <Example code={data.examples.title}>
        <Hamburger --color="#eee" title="Toggles the cat picture" />
    </Example>

    <p>Why not change the style</p>

    <Example code={data.examples.style}>
        <Hamburger --color="LightSkyBlue" />
    </Example>

    <p>We can then put this all together and create a full nav</p>

    <Example code={data.examples.fullExample}>
        <FullExample />
    </Example>
</section>

<section>
    <h2 id="props">Props</h2>

    <figure>
        <table>
            <thead>
                <tr>
                    <th>Property</th>
                    <th>Type</th>
                    <th>Default Value</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><code>open</code></td>
                    <td><code>string</code></td>
                    <td><code>false</code></td>
                    <td>
                        Controls and represents whether the hamburger is open.
                    </td>
                </tr>
                <tr>
                    <td><code>type</code></td>
                    <td><code>string</code></td>
                    <td><code>spin</code></td>
                    <td>
                        The type of burger you want, you can see the types
                        <a
                            href="https://github.com/ghostdevv/svelte-hamburgers/blob/main/types.md">
                            here
                        </a>, it should be lowercase.
                    </td>
                </tr>
                <tr>
                    <td><code>title</code></td>
                    <td><code>string</code></td>
                    <td><code>Hamburger menu</code></td>
                    <td>
                        Can be used to add a tooltip, also controls the default
                        value of the <code>ariaLabel</code> prop.
                    </td>
                </tr>
                <tr>
                    <td><code>ariaLabel</code></td>
                    <td><code>string</code></td>
                    <td>value of <code>title</code></td>
                    <td>A label that describes the hamburger menu.</td>
                </tr>
                <tr>
                    <td><code>ariaControls</code></td>
                    <td><code>string</code></td>
                    <td></td>
                    <td>
                        This identifies the element(s) whos presence is
                        controlled by the hamburger menu.
                    </td>
                </tr>
                <tr>
                    <td><code>--color</code></td>
                    <td><code>string</code></td>
                    <td><code>black</code></td>
                    <td>The color of the burger.</td>
                </tr>
                <tr>
                    <td><code>--active-color</code></td>
                    <td><code>string</code></td>
                    <td>value of <code>--color</code></td>
                    <td>The color of the burger when active.</td>
                </tr>
                <tr>
                    <td><code>--padding</code></td>
                    <td><code>string</code></td>
                    <td><code>15px</code></td>
                    <td>The padding.</td>
                </tr>
                <tr>
                    <td><code>--layer-width</code></td>
                    <td><code>string</code></td>
                    <td><code>30px</code></td>
                    <td>The width of the burger.</td>
                </tr>
                <tr>
                    <td><code>--layer-height</code></td>
                    <td><code>string</code></td>
                    <td><code>2px</code></td>
                    <td>The height of the burger.</td>
                </tr>
                <tr>
                    <td><code>--layer-spacing</code></td>
                    <td><code>string</code></td>
                    <td><code>6px</code></td>
                    <td>The spacing between layers of the burger.</td>
                </tr>
                <tr>
                    <td><code>--border-radius</code></td>
                    <td><code>string</code></td>
                    <td><code>4px</code></td>
                    <td>The border radius of each burger part.</td>
                </tr>
                <tr>
                    <td><code>--hover-opacity</code></td>
                    <td><code>number</code></td>
                    <td><code>0.7</code></td>
                    <td>The opacity amount on hover.</td>
                </tr>
                <tr>
                    <td><code>--hover-opacity-active</code></td>
                    <td><code>number</code></td>
                    <td>value of <code>--hover-opacity</code></td>
                    <td>The opacity amount of hover when active.</td>
                </tr>
                <tr>
                    <td><code>onclick</code></td>
                    <td>
                        <code>MouseEventHandler&lt;HTMLButtonElement&gt;</code>
                    </td>
                    <td></td>
                    <td>
                        Fires when the hamburger is clicked. This event won't
                        propagate.
                    </td>
                </tr>
            </tbody>
        </table>
    </figure>
</section>

<section>
    <h2 id="types">Types</h2>

    <div class="types">
        {#each HAMBURGER_TYPES as type}
            <div class="card type">
                <p>{type}</p>
                <Hamburger {type} />
            </div>
        {/each}
    </div>
</section>

<style lang="scss">
    .title {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .types {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 2rem;
    }

    $colors: hsl(351, 50%, 46%), hsl(203, 42%, 35%), hsl(60, 50%, 54%),
        hsl(120, 23%, 35%), Lavender, hsl(28, 50%, 46%);

    @for $i from 1 through length($colors) {
        .type:nth-child(#{length($colors)}n + #{$i}) {
            background: nth($colors, $i);
        }
    }

    .type {
        display: grid;
        place-items: center;
        width: 150px;
        height: 150px;
        color: black;
        border: none;
    }

    table {
        @media screen and (max-width: 1024px) {
            tr td:not(:last-child) {
                max-width: 200px;
                overflow-x: auto;
            }
        }
    }
</style>
