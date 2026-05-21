project = "Course Notes"
author = "Course Staff"

extensions = [
    "myst_parser",
    "sphinx.ext.mathjax",
]

source_suffix = {
    ".md": "markdown",
}

master_doc = "index"
exclude_patterns = ["_build", "README.md"]

myst_enable_extensions = [
    "amsmath",
    "colon_fence",
    "dollarmath",
]

myst_heading_anchors = 3
numfig = True

html_theme = "alabaster"
html_title = project
html_static_path = ["_static"]

html_css_files = [
    "css/course.css",
]

html_js_files = [
    "js/course-interactives.js",
    "js/course-page-toc.js",
    "js/examples/demo-plot.js",
]

mathjax3_config = {
    "tex": {
        "macros": {
            "dd": r"\mathrm{d}",
            "ppf": [r"\frac{\partial #1}{\partial #2}", 2],
            "pppf": [r"\frac{\partial^2 #1}{\partial #2^2}", 2],
            "ddf": [r"\frac{\mathrm{d} #1}{\mathrm{d} #2}", 2],
            "norm": [r"\left\lVert #1 \right\rVert", 1],
            "mbf": r"\mathbf",
            "mcl": r"\mathcal",
            "mbb": r"\mathbb",
            "Re": r"\mathrm{Re}",
            "Im": r"\mathrm{Im}",
        },
    },
}

html_theme_options = {
    "description": "Static Sphinx/MyST notes with browser-side examples",
    "fixed_sidebar": True,
}
