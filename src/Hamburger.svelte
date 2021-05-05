<!--
    A Svelte component implementation of hamburgers.css by Jonathan Suh
    https://jonsuh.com/hamburgers
-->
<script lang="ts">
    import { oneLine } from 'common-tags';

    // Required open boolean
    export let open: boolean;

    // Type
    export let type:
        | '3dx'
        | '3dx-r'
        | '3dy'
        | '3dy-r'
        | '3dxy'
        | '3dxy-r'
        | 'arrow'
        | 'arrow-r'
        | 'arrowalt'
        | 'arrowalt-r'
        | 'arrowturn'
        | 'arrowturn-r'
        | 'boring'
        | 'collapse'
        | 'collapse-r'
        | 'elastic'
        | 'elastic-r'
        | 'emphatic'
        | 'emphatic-r'
        | 'minus'
        | 'slider'
        | 'slider-r'
        | 'spin'
        | 'spin-r'
        | 'spring'
        | 'spring-r'
        | 'stand'
        | 'stand-r'
        | 'squeeze'
        | 'vortex'
        | 'vortex-r' = 'spin';

    // Color settings (We use the American spelling of "color" for simplicity as css uses that)
    export let color: string = 'white';
    export let activeColor: string = 'white';

    // Padding
    export let paddingX: string = '15px';
    export let paddingY: string = '15px';

    // Layer settings
    export let layerWidth: string = '40px';
    export let layerHeight: string = '4px';
    export let layerSpacing: string = '6px';
    export let borderRadius: string = '4px';

    // Hover filtering
    export let hoverOpacity: number = 0.7;
    export let activeHoverOpacity: number = 0.7;

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
    @use 'hamburgers/_sass/hamburgers/hamburgers' as *;

    .hamburger {
        padding: var(--paddingY) var(--paddingX);

        .hamburger-box {
            width: var(--layer-width);
            height: calc(var(--layer-height) * 3 + var(--layer-spacing) * 2);
        }

        .hamburger-inner {
            margin-top: calc(var(--layer-height) / -2);

            &,
            &::before,
            &::after {
                width: var(--layer-width);
                height: var(--layer-height);

                background-color: var(--color);
                border-radius: var(--border-radius);
            }

            &::before {
                top: calc(
                    calc(var(--layer-spacing) + var(--layer-height)) * -1
                );
            }

            &::after {
                bottom: calc(
                    calc(var(--layer-spacing) + var(--layer-height)) * -1
                );
            }
        }

        &:hover {
            opacity: var(--opacity);
        }

        &.is-active {
            &:hover {
                opacity: var(--opacity-active);
            }

            .hamburger-inner {
                &,
                &::before,
                &::after {
                    background-color: var(--color-active);
                }
            }
        }
    }
</style>
