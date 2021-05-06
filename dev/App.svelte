<script>
    import Hamburger from '../';

    const types = [
        '3dx',
        '3dx-r',
        '3dy',
        '3dy-r',
        '3dxy',
        '3dxy-r',
        'arrow',
        'arrow-r',
        'arrowalt',
        'arrowalt-r',
        'arrowturn',
        'arrowturn-r',
        'boring',
        'collapse',
        'collapse-r',
        'elastic',
        'elastic-r',
        'emphatic',
        'emphatic-r',
        'minus',
        'slider',
        'slider-r',
        'spin',
        'spin-r',
        'spring',
        'spring-r',
        'stand',
        'stand-r',
        'squeeze',
        'vortex',
        'vortex-r',
    ];
</script>

<cards>
    {#each types as ty}
        <card>
            <span>{ty}</span>
            <Hamburger type={ty} />
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
