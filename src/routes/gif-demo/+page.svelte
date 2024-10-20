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

    $colors: LightPink, LightSkyBlue, LightYellow, LightGreen, Lavender,
        PeachPuff;

    @for $i from 1 through length($colors) {
        .type:nth-child(#{length($colors)}n + #{$i}) {
            background: nth($colors, $i);
        }
    }

    .type {
        display: grid;
        place-items: center;
        color: black;
    }
</style>
