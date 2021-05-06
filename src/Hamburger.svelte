<!--
    A Svelte component implementation of hamburgers.css by Jonathan Suh
    https://jonsuh.com/hamburgers
-->
<script>
    import { oneLine } from 'common-tags';

    // Required open boolean
    export let open;

    // Type
    export let type = 'spin';

    // Color settings (We use the American spelling of "color" for simplicity as css uses that)
    export let color = 'black';
    export let activeColor = 'black';

    // Padding
    export let paddingX = '15px';
    export let paddingY = '15px';

    // Layer settings
    export let layerWidth = '40px';
    export let layerHeight = '4px';
    export let layerSpacing = '6px';
    export let borderRadius = '4px';

    // Hover filtering
    export let hoverOpacity = 0.7;
    export let activeHoverOpacity = 0.7;

    // Map inputs to css variables
    $: style = oneLine`
        --color: ${color};
        --color-active: ${activeColor};
        
        --paddingX: ${paddingX};
        --paddingY: ${paddingY};

        --layer-width: ${layerWidth};
        --layer-height: ${layerHeight};
        --layer-spacing: ${layerSpacing};
        --border-radius: ${borderRadius};

        --opacity: ${hoverOpacity};
        --opacity-active: ${activeHoverOpacity};
    `;
</script>

<button
    class="hamburger hamburger--{type} {open && 'is-active'}"
    {style}
    on:click={() => (open = !open)}>
    <span class="hamburger-box">
        <span class="hamburger-inner" />
    </span>
</button>

<style lang="scss">
    // Import the base scss
    @import 'base';

    // Import the types
    @import 'types/3dx';
    @import 'types/3dx-r';
    @import 'types/3dy';
    @import 'types/3dy-r';
    @import 'types/3dxy';
    @import 'types/3dxy-r';
    @import 'types/arrow';
    @import 'types/arrow-r';
    @import 'types/arrowalt';
    @import 'types/arrowalt-r';
    @import 'types/arrowturn';
    @import 'types/arrowturn-r';
    @import 'types/boring';
    @import 'types/collapse';
    @import 'types/collapse-r';
    @import 'types/elastic';
    @import 'types/elastic-r';
    @import 'types/emphatic';
    @import 'types/emphatic-r';
    @import 'types/minus';
    @import 'types/slider';
    @import 'types/slider-r';
    @import 'types/spin';
    @import 'types/spin-r';
    @import 'types/spring';
    @import 'types/spring-r';
    @import 'types/stand';
    @import 'types/stand-r';
    @import 'types/squeeze';
    @import 'types/vortex';
    @import 'types/vortex-r';
</style>
