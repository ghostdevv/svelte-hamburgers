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
    import type { MouseEventHandler } from 'svelte/elements';
    import type { HamburgerType } from './types.d';

    interface Props {
        /**
         * Open boolean
         * @default false
         */
        open?: boolean;

        /**
         * Hamburger type
         * @default "spin"
         */
        type?: HamburgerType;

        /**
         * AriaLabel string
         * @default "Hamburger menu"
         */
        ariaLabel?: string;

        /**
         * Hamburger onclick event
         */
        onclick?: MouseEventHandler<HTMLButtonElement>;
    }

    let {
        onclick,
        open = $bindable(false),
        type = 'spin',
        ariaLabel = 'Hamburger menu',
    }: Props = $props();
</script>

<button
    class="hamburger hamburger--{type}"
    aria-label={ariaLabel}
    class:is-active={open}
    onclick={(event) => {
        open = !open;
        onclick?.(event);
    }}>
    <span class="hamburger-box">
        <span class="hamburger-inner"></span>
    </span>
</button>

<style lang="scss">
    @import '../scss/base';
    @import '../scss/types/_all';
</style>
