# 🍔 Svelte Hamburgers

The ease to use Hamburger menu component for Svelte! Fully customisable with an extensive set of options, powered by a modified version of [hamburgers.css](https://github.com/jonsuh/hamburgers).

Example of how to use svelte-hamburgers, [view the repl here](https://svelte.dev/repl/2339dbd1356a4149aabb17daa0a17e40?version=3.42.4)
[![](https://i.imgur.com/cjLWZQk.gif)](https://svelte.dev/repl/2339dbd1356a4149aabb17daa0a17e40?version=3.42.4)

# Install

We will save it as a dev dependancy with `-D`

```bash
npm i svelte-hamburgers -D
```

# Adding CSS
You need to import the base styling and then a style for each [type](https://github.com/ghostdevv/svelte-hamburgers/blob/main/types.md) you want to use (to mitigate unused css)

Base sheet:
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/svelte-hamburgers@3/dist/css/base.css" />
```

Types:<br />
Replace `{type}` with the [type you want](https://github.com/ghostdevv/svelte-hamburgers/blob/main/types.md)
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/svelte-hamburgers@3/dist/css/types/{type}.css" />
```

# Sass
Svelte Hamburgers is written in `scss`, if you would prefer to import the scss files you can do so:
```scss
@import 'svelte-hamburgers/scss/base';
@import 'svelte-hamburgers/scss/types/{type}'; /* Replace {type} with the type you want */
```


# How to use?

```svelte
<script>
    import Hamburger from 'svelte-hamburgers';
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

# Properties

You can use these to customise the hamburger, just provide them as props to the burger component, for example `<Hamburger color="white" />`

| Property           | Type   | Default               | Description                                                                                                                                           |
| ------------------ | ------ | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| type               | string | spin                  | The type of burger you want, you can see the types [here](https://github.com/ghostdevv/svelte-hamburgers/blob/main/types.md), it should be lowercase. |
| color              | string | black                 | The color of the burger.                                                                                                                              |
| activeColor        | string | value of color        | The color of the burger when active.                                                                                                                  |
| paddingX           | string | 15px                  | The padding on the X axis.                                                                                                                            |
| paddingY           | string | 15px                  | The padding on the Y axis.                                                                                                                            |
| layerWidth         | string | 30px                  | The width of the burger.                                                                                                                              |
| layerHeight        | string | 2px                   | The height of the burger.                                                                                                                             |
| layerSpacing       | string | 6px                   | The spacing between layers of the burger.                                                                                                             |
| borderRadius       | string | 4px                   | The border radius of each burger part.                                                                                                                |
| hoverOpacity       | number | 0.7                   | The opacity amount on hover.                                                                                                                          |
| activeHoverOpacity | number | value of hoverOpacity | The opacity amount of hover when active.                                                                                                              |

# Support

-   Join the [discord](https://discord.gg/2Vd4wAjJnm)<br>
-   Create a issue on the [github](https://github.com/ghostdevv/svelte-hamburgers)
