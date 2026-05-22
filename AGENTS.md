# Agent Guidelines

This repository is a static Sphinx/MyST site for interactive notes.

This is a graduate-level course for modal analysis of nonlinear dynamical systems.

## Documentation Structure

- Keep chapter content in Markdown under `docs/chapters/`.
- Name numbered chapter files as `NN_<chapter_title_slug>.md`, where `NN` is
  the two-digit chapter number and the title slug is lowercase snake case. For
  example, Chapter 1 "Model Taxonomy" should be
  `docs/chapters/01_model_taxonomy.md`.
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
- Interactive examples may be added for visualizing hand-derived examples only.
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

## Interactive Spec Blocks

- Use MyST containers to mark planned interactive examples before
  implementation. Do not use raw custom HTML tags such as `<interaction>`.
- Temporary specs should use the `interactive-spec` class and a stable `:name:`
  value:

  ```md
  :::{container} interactive-spec
  :name: interactive-spec-ch01-oscillator

  Visualize the hand-derived oscillator example. Show phase-plane motion,
  time traces, and controls for frequency and initial condition.

  Reference implementation: `ch01_oscillator.py`
  :::
  ```

- When implementing a spec, replace the `interactive-spec` block with the final
  `course-interactive` placeholder and move all runtime behavior into
  `docs/_static/js/examples/`.
- Treat reference implementations as
  optional, read-only drafting aids, not as source files for the built site.
- Before resolving the reference path, prepend `../../scratch/`.  For example,
  `ch01_oscillator.py` would mean `../../scratch/ch01_oscillator.py`.  Agents
  working from `.a-dev/worktrees/<name>/` should look in the sibling scratch
  directory at `.a-dev/scratch/`, without requiring the chapter Markdown to use
  `../../scratch/` path prefixes.
- If a referenced scratch file is missing, proceed from the written spec rather
  than blocking.

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
- For Plotly examples, use the shared `renderPlotly` helper from
  `window.CourseInteractives` rather than calling `Plotly.react` directly. This
  keeps generated Plotly components resized to the main text column and prevents
  plots from overflowing or being clipped by the interactive container.
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

- Run `make check` before handing off any change that adds or edits chapters,
  updates `docs/index.md`, changes Sphinx configuration, or changes static site
  assets. This is the required pre-review check for documentation work and runs
  both the fresh Sphinx build and the test suite.
- Use `make html` for an intermediate documentation-only check while drafting.
  The handoff check is still `make check`.
- For interactive examples, verify at least one rendered page in a browser when
  behavior changes.
