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
    export let color = 'white';
    export let activeColor = 'white';

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

        background-color: red;
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
