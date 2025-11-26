.PHONY: install test run run-server dev dev-backend dev-frontend clean

PYTHON ?= python
PIP ?= pip
UVICORN ?= uvicorn
NPM ?= npm

install:
	$(PIP) install -e .[dev]

test:
	$(PYTHON) -m pytest

run:
	$(UVICORN) app.server:app --reload --port 8000

run-server:
	$(UVICORN) app.server:app --reload --host 0.0.0.0 --port 8000

dev-backend:
	$(UVICORN) app.server:app --reload --port 8000

dev-frontend:
	cd ui && $(NPM) install && $(NPM) run dev

dev:
	@echo "Execute 'make dev-backend' e 'make dev-frontend' em terminais separados."

clean:
	$(PYTHON) -c "import shutil, pathlib;\nfor target in ('__pycache__', '.pytest_cache', 'app/__pycache__'):\n    shutil.rmtree(pathlib.Path(target), ignore_errors=True)"
