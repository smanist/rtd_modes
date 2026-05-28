# a-rtd:begin managed name="sphinx-myst-course" version="0.1.0"
from a_rtd.sphinx_ext import apply_defaults

project = "Interactive Notes"
author = "Course Staff"
a_rtd_theme_description = "Modal Analysis of Nonlinear Dynamical Systems"
a_rtd_example_js_files = [
    "js/examples/chapter2-linear-autonomous.js",
    "js/examples/chapter3-phase-planes.js",
    "js/examples/chapter3-initial-gain.js",
    "js/examples/chapter3-pseudospectrum.js",
    "js/examples/chapter3-transient-energy.js",
    "js/examples/chapter5-time-varying.js",
    "js/examples/chapter14-modes-on-manifolds.js",
    "js/examples/demo-plot.js",
    "js/examples/python-demo.js",
]
extensions = ["a_rtd.sphinx_ext"]

apply_defaults(globals())
templates_path = ["_templates"]
# a-rtd:end managed
