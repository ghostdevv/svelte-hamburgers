<script lang="ts">
    import { Hamburger, HAMBURGER_TYPES } from '$lib';
</script>

<cards>
    {#each HAMBURGER_TYPES as type}
        <card>
            <span>{type}</span>
            <Hamburger {type} />
        </card>
    {/each}
</cards>

<style lang="scss" global>
    *,
    *::before,
    *::after {
        box-sizing: border-box;
        margin: 0px;
        padding: 0px;
    }

    cards {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
    }

    $colors: red, orange, yellow, green, blue, purple;

    @for $i from 1 through length($colors) {
        card:nth-child(#{length($colors)}n + #{$i}) {
            background: lighten(nth($colors, $i), 20%);
        }
    }

    card {
        width: 250px;
        height: 250px;
        display: block;
        display: grid;
        place-items: center;
        border: 2px solid black;
        font-family: Arial, Helvetica, sans-serif;
    }
</style>
