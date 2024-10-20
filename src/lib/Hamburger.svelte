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

    [View the full docs](https://svelte-hamburgers.willow.codes).
-->

<script lang="ts">
    import type { MouseEventHandler } from 'svelte/elements';
    import type { HamburgerType } from './types';

    interface Props {
        /**
         * Controls and represents whether the hamburger is open
         * @default false
         */
        open?: boolean;

        /**
         * The type of the hamburger
         * @default "spin"
         * @see https://svelte-hamburgers.willow.codes#types
         */
        type?: HamburgerType;

        /**
         * Can be used to add a tooltip, also controls the default value of the `ariaLabel` prop
         * @default "Hamburger menu"
         * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/title
         */
        title?: string;

        /**
         * A label that describes the hamburger menu.
         * Defaults to the value of the `title` prop, which defaults to `Hamburger menu`.
         * @see https://www.w3.org/TR/wai-aria-1.1/#aria-label
         */
        ariaLabel?: string;

        /**
         * This identifies the element(s) whos presence is controlled by the hamburger menu
         * @see https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-controls
         * @see https://www.w3.org/TR/wai-aria-1.1/#aria-controls
         */
        ariaControls?: string;

        /**
         * Fires when the hamburger is clicked. This event won't propagate.
         */
        onclick?: MouseEventHandler<HTMLButtonElement>;
    }

    let {
        open = $bindable(false),
        type = 'spin',
        title = 'Hamburger menu',
        ariaControls,
        ariaLabel = title,
        onclick,
    }: Props = $props();
</script>

<button
    {title}
    aria-label={ariaLabel}
    aria-controls={ariaControls}
    aria-expanded={open}
    class="hamburger hamburger--{type}"
    class:is-active={open}
    onclick={(event) => {
        event.stopPropagation();
        open = !open;
        onclick?.(event);
    }}>
    <span class="hamburger-box">
        <span class="hamburger-inner"></span>
    </span>
</button>

<style lang="scss">
    @use '../scss/base' as *;
    @use '../scss/types/_all' as *;
</style>
