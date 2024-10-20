<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        code: string;
        children?: Snippet;
    }

    let { code, children }: Props = $props();
</script>

<div class="example-wrapper">
    {@html code}

    <div class="example">
        {@render children?.()}
    </div>
</div>

<style lang="scss">
    .example-wrapper {
        display: grid;
        grid-template-columns: 1fr 0.5fr;
        grid-template-rows: 1fr;
        align-items: start;

        width: 100%;
        margin-bottom: 8px;

        @media screen and (max-width: 768px) {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr;
        }
    }

    .example {
        padding: 8px;
    }

</style>
