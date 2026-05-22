# Agent Guidelines

This repository is a static Sphinx/MyST site for interactive course notes.

This is a graduate-level course for modal analysis of nonlinear dynamical systems.

## Documentation Structure

- Keep chapter content in Markdown under `docs/chapters/`.
- Prefer MyST syntax for math, cross-references, figures, and directives.
- Keep Sphinx configuration in `docs/conf.py`.
- Keep shared styling in `docs/_static/css/`.
- Keep browser-side interactive code in `docs/_static/js/`.

## Syllabus File Policy

- Treat all files under `syllabus/` as read-only reference material.
- Do not modify files under `syllabus/` during notes implementation work.
- Use `syllabus/modal_analysis_topic_example_map.md` as guidance for
  topic/example alignment when drafting or updating notes.

## Temporary Implementation Scope

- At this stage, implement only theory content and hand-derivable examples.
- Do not add recurring engineering examples yet.
- Do not add new interactive examples to course chapters yet.
- Existing interactive infrastructure may be maintained or fixed when explicitly
  requested.

## Notation Policy and Quick Reference

- Notation in notes should follow `syllabus/notation_convention.md`.
- Parentheses in the notation table indicate displayed examples. In chapter
  prose, write inline math using MyST/Markdown math delimiters such as
  `$x(t)$`, `$x_k$`, and `$\mathbf{x}_k$`.

### Rule of Thumb

> Plain italic symbols describe mathematical objects in the model.
> Bold symbols describe sampled numerical data or assembled arrays.
> Calligraphic symbols describe operators and spaces.
> Blackboard-bold symbols describe standard number spaces or expectations.
> Subscripts index components, time steps, or modes; parenthesized
> superscripts index realizations or labels.

### Compact Notation Table

| Quantity                | Recommended notation |
| ----------------------- | -------------------- |
| continuous-time state   | `(x(t))`             |
| discrete-time state     | `(x_k)`              |
| numerical snapshot      | `(\mathbf{x}_k)`    |
| component of state      | `(x_i)`              |
| snapshot matrix         | `(\mathbf{X})`      |
| shifted snapshot matrix | `(\mathbf{Y})`      |
| input/output            | `(u(t), y(t))`       |
| state matrix            | `(A)`                |
| input/output matrices   | `(B,C,D)`            |
| mass/damping/stiffness  | `(M,C,K)`            |
| mode shape/eigenvector  | `(\phi_j)`          |
| adjoint mode            | `(\psi_j)`          |
| eigenvalue              | `(\lambda_j)`       |
| natural frequency       | `(\omega_j)`        |
| modal coordinate        | `(\eta_j(t))`       |
| modal basis             | `(\Phi_r)` or `(V_r)` |
| reduction basis         | `(V_r)`              |
| test basis              | `(W_r)`              |
| reduced state           | `(a(t))`             |
| Koopman operator        | `(\mathcal{K}^t)`   |
| Koopman generator       | `(\mathcal{L})`     |
| observable              | `(g)`                |
| Koopman eigenfunction   | `(\varphi_j)`       |
| state-transition matrix | `(\Phi(t,t_0))`     |
| monodromy matrix        | `(M_F)`              |
| Floquet multiplier      | `(\rho_j)`          |
| Floquet exponent        | `(\nu_j)`           |
| Lyapunov exponent       | `(\chi_j)`          |
| CLV                     | `(\ell_j(t))`       |
| covariance              | `(C_x)`              |
| cross-spectral density  | `(S_x(\omega))`     |
| resolvent               | `(R(i\omega;A))`    |
| Hilbert space           | `(\mathcal{H})`     |
| manifold                | `(\mathcal{M})`     |
| invariant measure       | `(\mu)`             |
| expectation             | `(\mathbb{E})`      |

## Avoid Raw HTML in Chapters

- Do not put large raw HTML, inline scripts, or implementation logic directly
  inside chapter Markdown files.
- A chapter may embed an interactive example in prose, but the Markdown should
  contain only a small semantic MyST placeholder when possible.
- Prefer MyST containers with identifying classes:

  ```md
  :::{container} course-interactive
  :data-example: demo-plot

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
- When adding a chapter, add it to the `docs/index.md` toctree unless it is
  intentionally hidden.
- After conversion, run a fresh Sphinx build when navigation, labels, or math
  parsing changed.

## Modular Interactive Examples

These conventions apply when interactive work is explicitly in scope, or when
maintaining existing interactive infrastructure.

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

- Run `make html` after documentation or static asset changes. This uses a
  fresh Sphinx build through `sphinx-build -E -b html docs docs/_build/html`.
- Run `pytest` when changing `docs/conf.py`, `docs/index.md`, registered
  example scripts, or test-covered infrastructure.
- For interactive examples, verify at least one rendered page in a browser when
  behavior changes.
