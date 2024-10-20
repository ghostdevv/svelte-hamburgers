<script>
    import Hamburger from '$lib/Hamburger.svelte';
    import { fly } from 'svelte/transition';

    let open = $state(false);
</script>

<div class="nav">
    <Hamburger
        bind:open
        type="collapse"
        title="Toggle nav links"
        ariaControls="nav"
        --color="#eee" />

    {#if open}
        <ul id="nav" class="menu" transition:fly={{ y: -15 }}>
            <li>Home</li>
            <li>About</li>
            <li>Contact</li>
        </ul>
    {/if}
</div>

<style>
    .nav {
        display: grid;
        grid-template-columns: max-content 1fr;
        grid-template-rows: 1fr;
        align-items: start;
    }

    .menu {
        text-align: center;
        font-size: 1.3rem;
        letter-spacing: 0.15em;
        padding-top: 0;
    }

    ul {
        list-style: none;
    }

    li {
        cursor: pointer;
        width: max-content;
        margin: 0.6rem;
        margin-left: 1rem;

        &:hover {
            text-decoration: underline;
        }

        &:first-child {
            margin-top: 15px;
        }
    }
</style>
