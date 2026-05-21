# Interactive Example

This page demonstrates the reusable interaction infrastructure. The Markdown
contains only a semantic placeholder; the controls and plot are created in
`docs/_static/js/examples/demo-plot.js`.

## Demo Plot

:::{container} course-interactive course-interactive-demo-plot
Interactive example loading...
:::

## Implementation Notes

Each example initializer receives the placeholder element, reads optional
configuration from `data-*` attributes, and renders into that element. Shared
helpers for controls and lazy-loaded libraries are available on
`window.CourseInteractives`.
