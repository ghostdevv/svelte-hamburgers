<!--
    A Svelte component implementation of hamburgers.css by Jonathan Suh
    https://jonsuh.com/hamburgers
-->
<script>
    // Required open boolean
    export let open;

    /**
     * Hamburger type
     */
    export let type = 'spin';

    /**
     * The base color of the hamburger
     */
    export let color = 'black';

    /**
     * The color when the hamburger is active (defaults to the value of color)
     * @type {string}
     */
    export let activeColor = color;

    /**
     * Padding left and right of the hamburger
     */
    export let paddingX = '12px';

    /**
     * Padding top and bottom of the hamburger
     */
    export let paddingY = '12px';

    /**
     * The width of each layer of the hamburger
     */
    export let layerWidth = '30px';

    /**
     * The height of each layer of the hamburger
     */
    export let layerHeight = '4px';

    /**
     * The spacing between each layer of the hamburger
     */
    export let layerSpacing = '6px';

    /**
     * The border radius of each layer of the hamburger
     */
    export let borderRadius = '4px';

    /**
     * The amount of opacity when you hover over the hamburger
     */
    export let hoverOpacity = 0.7;

    /**
     * The amount of opacity when the hamburger is active (defaults to the value of hoverOpacity)
     * @type {number}
     */
    export let activeHoverOpacity = hoverOpacity;

    // Map inputs to css variables
    $: style = `
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
