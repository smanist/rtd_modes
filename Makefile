LOCAL_DOCS_HOST ?= 127.0.0.1
LOCAL_DOCS_PORT ?= 8765
LOCAL_DOCS_URL := http://$(LOCAL_DOCS_HOST):$(LOCAL_DOCS_PORT)/docs/_build/html/

.PHONY: html check serve-html check-local-html

html:
	sphinx-build -E -b html docs docs/_build/html

check: html
	pytest

serve-html: html
	python -m http.server $(LOCAL_DOCS_PORT) --bind $(LOCAL_DOCS_HOST)

check-local-html:
	curl -sSf $(LOCAL_DOCS_URL) >/dev/null
