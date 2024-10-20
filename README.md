# 🍔 Svelte Hamburgers

A customisable Svelte port of the popular [hamburgers.css](https://github.com/jonsuh/hamburgers) library.

![demo gif](https://raw.githubusercontent.com/ghostdevv/svelte-hamburgers/9c284ea2b94a6d940338acf737cbf5366c30cce2/.github/demo.gif)

# Installation

```bash
npm install svelte-hamburgers -D
```

If you want to use the Svelte 3/4 version of this library, please checkout [svelte-hamburgers@4](https://www.npmjs.com/package/svelte-hamburgers/v/4.2.1).

# Usage

```svelte
<script lang="ts">
    import { Hamburger } from 'svelte-hamburgers';
</script>

<Hamburger />
```

[View the full docs](https://svelte-hamburgers.willow.codes).

# Props

| Property                 | Type                                   | Default Value              | Description                                                                                                                                           |
| ------------------------ | -------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open`                   | `string`                               | `false`                    | Controls and represents whether the hamburger is open.                                                                                                |
| `type`                   | `string`                               | `spin`                     | The type of burger you want, you can see the types [here](https://github.com/ghostdevv/svelte-hamburgers/blob/main/types.md), it should be lowercase. |
| `title`                  | `string`                               | `Hamburger menu`           | Can be used to add a tooltip, also controls the default value of the `ariaLabel` prop.                                                                |
| `ariaLabel`              | `string`                               | value of `title`           | A label that describes the hamburger menu.                                                                                                            |
| `ariaControls`           | `string`                               |                            | This identifies the element(s) whos presence is controlled by the hamburger menu.                                                                     |
| `--color`                | `string`                               | `black`                    | The color of the burger.                                                                                                                              |
| `--active-color`         | `string`                               | value of `--color`         | The color of the burger when active.                                                                                                                  |
| `--padding`              | `string`                               | `15px`                     | The padding.                                                                                                                                          |
| `--layer-width`          | `string`                               | `30px`                     | The width of the burger.                                                                                                                              |
| `--layer-height`         | `string`                               | `2px`                      | The height of the burger.                                                                                                                             |
| `--layer-spacing`        | `string`                               | `6px`                      | The spacing between layers of the burger.                                                                                                             |
| `--border-radius`        | `string`                               | `4px`                      | The border radius of each burger part.                                                                                                                |
| `--hover-opacity`        | `number`                               | `0.7`                      | The opacity amount on hover.                                                                                                                          |
| `--hover-opacity-active` | `number`                               | value of `--hover-opacity` | The opacity amount of hover when active.                                                                                                              |
| `onclick`                | `MouseEventHandler<HTMLButtonElement>` |                            | Fires when the hamburger is clicked. This event won't propagate.                                                                                      |

# Migrating to svelte-hamburgers v5

-   Now requires Svelte 5, if you require Svelte 3/4 support checkout [svelte-hamburgers@4](https://www.npmjs.com/package/svelte-hamburgers/v/4.2.1).
-   We now call `stopPropagation` on hamburger click event for you.
-   The `ariaLabel` prop now gets its default value from the `title` prop.

View the full [changelog on GitHub](https://github.com/ghostdevv/svelte-hamburgers/releases).

# Support

-   Join the [discord](https://discord.gg/2Vd4wAjJnm)<br>
-   Create a issue on the [github](https://github.com/ghostdevv/svelte-hamburgers)
