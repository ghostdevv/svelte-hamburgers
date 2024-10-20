<!--
    @component
    
    A Svelte component implementation of [hamburgers.css](https://jonsuh.com/hamburgers)
    by Jonathan Suh

    ```svelte
    <script lang="ts">
        import { Hamburger } from 'svelte-hamburgers';

        let open = $state(false);
    </script>

    <Hamburger bind:open />
    ```

    The `open` variable can be then used to handle your menu, for example:

    ```svelte
    {#if open}
        Show your menu here!
    {/if}
    ```

    [View the full docs](https://github.com/ghostdevv/svelte-hamburgers/blob/main/README.md).
-->

<script lang="ts">
    import type { HamburgerType } from './types.d';

    /**
     * Open boolean
     * @type {boolean}
     * @default false
     */
    export let open: boolean = false;

    /**
     * Hamburger type
     * @type {HamburgerType}
     * @default "spin"
     */
    export let type: HamburgerType = 'spin';
    
    /**
     * AriaLabel string
     * @type {string}
     * @default "Hamburger menu"
     */
    export let ariaLabel: string = 'Hamburger menu'
</script>

<button
    class="hamburger hamburger--{type}"
    aria-label={ariaLabel}
    class:is-active={open}
    on:click
    on:click={() => (open = !open)}>
    <span class="hamburger-box">
        <span class="hamburger-inner"></span>
    </span>
</button>

<style lang="scss">
    @import '../scss/base';
    @import '../scss/types/_all';
</style>
