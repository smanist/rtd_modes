# Course Notes

These notes are built with Sphinx and MyST Markdown. Chapters can use ordinary
Markdown, Sphinx cross-references, figures, and LaTeX equations.

```{toctree}
:maxdepth: 1
:caption: Contents

chapters/01_model_taxonomy
chapters/02_linear_autonomous_systems
chapters/04_second_order_mechanical_modal_analysis
chapters/06_floquet_analysis
chapters/getting-started
chapters/interactive-example
```

## Site Conventions

- Write chapters as Markdown files in `docs/chapters/`.
- Put reusable browser code in `docs/_static/js/`.
- Put small embedded example placeholders in the Markdown where each
  interactive example should appear.
- Keep heavyweight libraries pinned by exact CDN version until the site needs
  vendored or offline assets.
