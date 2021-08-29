<!--
    A Svelte component implementation of hamburgers.css by Jonathan Suh
    https://jonsuh.com/hamburgers
-->
<script>
    /**
     * Open boolean
     * @type {boolean}
     */
    export let open;

    /**
     * Hamburger type
     */
    export let type = 'spin';
</script>

<button
    class="hamburger hamburger--{type} {open && 'is-active'}"
    on:click
    on:click={() => (open = !open)}>
    <span class="hamburger-box">
        <span class="hamburger-inner" />
    </span>
</button>
