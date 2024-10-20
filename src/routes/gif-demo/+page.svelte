<script lang="ts">
    import { Hamburger, type HamburgerType } from '$lib';
    import { onMount } from 'svelte';

    const { data } = $props();

    const TYPES: HamburgerType[] = ['spin', 'elastic', 'vortex', 'squeeze'];

    let codeElement = $state<HTMLDivElement>();
    let spanElement = $state<HTMLSpanElement>();
    let selectedType = $state('spin');

    $effect(() => {
        if (spanElement) {
            spanElement.innerText = selectedType;
        }
    });

    onMount(() => {
        const spans = Array.from(codeElement.querySelectorAll('span'));
        spanElement = spans.find((s) => s.innerText == '__type__');
    });
</script>

<section class="gif">
    <div class="code" bind:this={codeElement}>
        {@html data.code}
    </div>

    {#each TYPES as type}
        <div class="card type" onpointerover={() => (selectedType = type)}>
            <p>{type}</p>
            <Hamburger {type} />
        </div>
    {/each}
</section>

<style lang="scss">
    @use 'sass:list';

    .gif {
        display: grid;
        grid-template-columns: repeat(4, 264px);
        grid-template-rows: repeat(2, 150px);
        gap: 8px;
        width: 100%;

        .code {
            grid-column: 2 / span 2;
            grid-row: 1 / span 2;
            height: 100%;
        }

        .type {
            width: 100%;
            margin: 0px;
            border: none;
        }
    }

    :global(.gif pre code),
    :global(.gif pre) {
        height: 100%;
    }

    $colors: hsl(351, 50%, 46%), hsl(203, 42%, 35%), hsl(60, 50%, 54%),
        hsl(120, 23%, 35%), Lavender, hsl(28, 50%, 46%);

    @for $i from 1 through list.length($colors) {
        .type:nth-child(#{list.length($colors)}n + #{$i}) {
            background: list.nth($colors, $i);
        }
    }

    .type {
        display: grid;
        place-items: center;
        color: black;
    }
</style>
