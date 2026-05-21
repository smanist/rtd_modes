# Course Notes Skeleton

A reusable static Sphinx/MyST starter for course notes with:

- Markdown chapters in `docs/chapters/`
- MathJax macros configured in `docs/conf.py`
- A left navigation sidebar from Sphinx
- A generated right sidebar for the current page
- Browser-side interactive examples with lazy-loaded plotting/runtime libraries
- No login, account gate, or backend dependency

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

## Build

```bash
sphinx-build -b html docs docs/_build/html
```

## Serve Locally

```bash
python -m http.server 8765 --bind 127.0.0.1
```

Open `http://localhost:8765/docs/_build/html/`.

When finished, stop the server with:

```bash
scripts/kill-local-http-server <pid>
```

## Add an Interactive Example

1. Add a semantic placeholder to a chapter:

   ```md
   :::{container} course-interactive course-interactive-my-example
   Interactive example loading...
   :::
   ```

2. Add `docs/_static/js/examples/my-example.js`.
3. Register the initializer with `CourseInteractives.registerExample(...)`.
4. Add the script to `html_js_files` in `docs/conf.py`.
