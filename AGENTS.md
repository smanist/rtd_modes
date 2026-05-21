# Agent Guidelines

This repository is a static Sphinx/MyST site for interactive course notes.

## Documentation Structure

- Keep chapter content in Markdown under `docs/chapters/`.
- Prefer MyST syntax for math, cross-references, figures, and directives.
- Keep Sphinx configuration in `docs/conf.py`.
- Keep shared styling in `docs/_static/css/`.
- Keep browser-side interactive code in `docs/_static/js/`.

## Avoid Raw HTML in Chapters

- Do not put large raw HTML, inline scripts, or implementation logic directly
  inside chapter Markdown files.
- A chapter may embed an interactive example in prose, but the Markdown should
  contain only a small semantic MyST placeholder when possible.
- Prefer MyST containers with identifying classes:

  ```md
  :::{container} course-interactive course-interactive-demo
  Interactive example loading...
  :::
  ```

- Put JavaScript, plotting logic, Pyodide calls, and DOM construction in static
  JavaScript files.
- If a raw HTML block grows beyond a small placeholder, move that behavior into
  a reusable directive, template, or JavaScript module.

## Importing Chapters

- Do not leave top-level LaTeX macro definitions such as `\newcommand` in the
  chapter body. Move shared macros into `mathjax3_config` in `docs/conf.py`.
- Convert display math written as `$$ ... $$` to MyST math fences:

  ````md
  ```{math}
  ...
  ```
  ````

- Preserve equation labels during conversion. For example, convert
  `$$ ... $$ {#eq:model}` to:

  ````md
  ```{math}
  :label: eq:model

  ...
  ```
  ````

- Give every imported chapter one real page title heading.
- If the sample uses level-1 headings for sections, demote them one level after
  adding the page title. This prevents Sphinx sidebars and toctrees from
  treating each section as a separate page-level entry.
- After conversion, run a fresh Sphinx build when navigation, labels, or math
  parsing changed.

## Modular Interactive Examples

- Keep interactive examples as individual JavaScript files whenever possible.
- Use one file per example or closely related example family.
- Keep `docs/_static/js/course-interactives.js` focused on shared loader,
  registry, and initialization behavior.
- Example files should register a small initializer that receives the
  placeholder element and reads configuration from `data-*` attributes.
- Avoid duplicating CDN loading logic across example files. Use shared helpers
  for Plotly, Pyodide, p5.js, and JSXGraph.
- Recompute examples from user inputs in the browser only. Do not introduce a
  backend dependency.

## Asset Loading

- Use pinned CDN versions for Plotly, Pyodide, p5.js, and JSXGraph unless the
  project explicitly switches to vendored assets.
- Lazy-load heavyweight libraries only when an example actually needs them.
- Keep the site deployable as a static Sphinx build.

## Local Website Workflow

- For quick local checks, start a server from the repository root with
  `python -m http.server <port> --bind 127.0.0.1`.
- Visit local pages at `http://localhost:<port>/docs/_build/html/` after a
  Sphinx build, or serve a built output directory directly.
- Stop repo-local HTTP servers with `scripts/kill-local-http-server <pid>`.
  Do not use raw `kill <pid>` for this workflow.

## Verification

- Run `sphinx-build -b html docs docs/_build/html` after documentation or
  static asset changes.
- For interactive examples, verify at least one rendered page in a browser when
  behavior changes.
