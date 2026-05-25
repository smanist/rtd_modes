PORT ?= 8765
BIND ?= 127.0.0.1

.PHONY: html check serve-html check-local-html

html:
	sphinx-build -E -b html docs docs/_build/html

check: html
	pytest

serve-html: html
	python -m http.server $(PORT) --bind $(BIND)

check-local-html: html
	@python -m http.server $(PORT) --bind $(BIND) >/tmp/rtd-modes-http.log 2>&1 & \
	pid=$$!; \
	trap 'scripts/kill-local-http-server $$pid >/dev/null 2>&1 || true' EXIT; \
	sleep 1; \
	curl -sSf http://$(BIND):$(PORT)/docs/_build/html/ >/dev/null; \
	curl -sSf http://$(BIND):$(PORT)/docs/_build/html/chapters/03_non_normality_transient_growth_and_pseudospectra.html >/dev/null; \
	pytest
