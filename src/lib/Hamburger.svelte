<!--
    A Svelte component implementation of hamburgers.css by Jonathan Suh
    https://jonsuh.com/hamburgers
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
</script>

<button
    class="hamburger hamburger--{type}"
    aria-label="Hamburger menu"
    class:is-active={open}
    on:click
    on:click={() => (open = !open)}>
    <span class="hamburger-box">
        <span class="hamburger-inner" />
    </span>
</button>

<style lang="scss">
    @import '../scss/base';
    @import '../scss/types/_all';
</style>
