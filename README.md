# Svelte Hamburgers

Animated (or not) hamburgers for Svelte based on the popular [hamburgers.css](https://jonsuh.com/hamburgers/).

# How to use?

In your Svelte files:

```svelte
<script>
    import Hamburger from 'svelte-hamburgers';
    let open;
</script>

<Hamburger bind:open />
```

# Properties

You can use these to customise the hamburger, just provide them as props to the burger component.

| Property           | Type   | Default | Description                                                                                                        |
| ------------------ | ------ | ------- | ------------------------------------------------------------------------------------------------------------------ |
| type               | string | spin    | The type of burger you want, you can see the types [here](https://jonsuh.com/hamburgers/), it should be lowercase. |
| color              | string | white   | The color of the burger.                                                                                           |
| activeColor        | string | white   | The color of the burger when active.                                                                               |
| paddingX           | string | 15px    | The padding on the X axis.                                                                                         |
| paddingY           | string | 15px    | The padding on the Y axis.                                                                                         |
| layerWidth         | string | 40px    | The width of the burger.                                                                                           |
| layerHeight        | string | 4px     | The height of the burger.                                                                                          |
| layerSpacing       | string | 6px     | The spacing between layers of the burger.                                                                          |
| borderRadius       | string | 4px     | The border radius of each burger part.                                                                             |
| hoverOpacity       | number | 0.7     | The opacity amount on hover.                                                                                       |
| activeHoverOpacity | number | 0.7     | The opacity amount of hover when active.                                                                           |
