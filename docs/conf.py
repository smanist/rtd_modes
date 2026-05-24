from html import escape

from docutils import nodes
from docutils.parsers.rst import Directive, directives


project = "Interactive Notes"
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
    "js/examples/chapter3-phase-planes.js",
    "js/examples/chapter3-initial-gain.js",
    "js/examples/chapter3-pseudospectrum.js",
    "js/examples/chapter3-transient-energy.js",
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
    "description": "Modal Analysis of Nonlinear Dynamical Systems",
    "fixed_sidebar": True,
}


class CourseInteractiveDirective(Directive):
    has_content = True
    option_spec = {
        "data-example": directives.unchanged_required,
        "name": directives.unchanged,
    }

    def run(self):
        self.assert_has_content()
        content = nodes.container()
        self.state.nested_parse(self.content, self.content_offset, content)
        data_example = escape(self.options["data-example"], quote=True)

        return [
            nodes.raw(
                "",
                f'<div class="course-interactive" data-example="{data_example}">',
                format="html",
            ),
            *content.children,
            nodes.raw("", "</div>", format="html"),
        ]


def setup(app):
    app.add_directive("course-interactive", CourseInteractiveDirective)
