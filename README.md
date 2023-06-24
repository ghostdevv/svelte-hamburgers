# 🍔 Svelte Hamburgers

Works with Svelte 3 & 4!

The ease to use Hamburger menu component for Svelte! Fully customisable with an extensive set of options, powered by a modified version of [hamburgers.css](https://github.com/jonsuh/hamburgers).

Example of how to use svelte-hamburgers, [view the repl here](https://svelte.dev/repl/c94eebb874584f2fb62c0303738b7509?version=3.42.4)
[![](https://i.imgur.com/M12rZCQ.gif)](https://svelte.dev/repl/c94eebb874584f2fb62c0303738b7509?version=3.42.4)

# Install

We will save it as a dev dependancy with `-D`

```bash
npm i svelte-hamburgers -D
```

# How to use?

```html
<script>
    import { Hamburger } from 'svelte-hamburgers';

    let open;
</script>

<Hamburger bind:open />
```

The `open` variable can be then used to handle your menu, for example:

```svelte
{#if open}
    <!-- show menu -->
{/if}
```

# Migrating

If you are migrating from `3.x.x` to `4.x.x` heres what you need to know:

- CSS is now included! This means no more importing the css you need, you can remove the cdn tags you had before

- The `Hamburger` component is a named import:
    ```html
    <script>
        // Old way
        import Hamburger from 'svelte-hamburgers';

        // New way
        import { Hamburger } from 'svelte-hamburgers';
    </script>
    ```

# Properties

You can use these to customise the hamburger, just provide them as props to the burger component, for example `<Hamburger --color="white" />`

| Property               | Type   | Default                  | Description                                                                                                                                           |
|------------------------|--------|--------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| type                   | string | spin                     | The type of burger you want, you can see the types [here](https://github.com/ghostdevv/svelte-hamburgers/blob/main/types.md), it should be lowercase. |
| --color                | string | black                    | The color of the burger.                                                                                                                              |
| --active-color         | string | value of --color         | The color of the burger when active.                                                                                                                  |
| --padding              | string | 15px                     | The padding.                                                                                                                                          |
| --layer-width          | string | 30px                     | The width of the burger.                                                                                                                              |
| --layer-height         | string | 2px                      | The height of the burger.                                                                                                                             |
| --layer-spacing        | string | 6px                      | The spacing between layers of the burger.                                                                                                             |
| --border-radius        | string | 4px                      | The border radius of each burger part.                                                                                                                |
| --hover-opacity        | number | 0.7                      | The opacity amount on hover.                                                                                                                          |
| --hover-opacity-active | number | value of --hover-opacity | The opacity amount of hover when active.                                                                                                              |

# Support

-   Join the [discord](https://discord.gg/2Vd4wAjJnm)<br>
-   Create a issue on the [github](https://github.com/ghostdevv/svelte-hamburgers)
