.PHONY: html check

html:
	sphinx-build -E -b html docs docs/_build/html

check: html
	pytest
