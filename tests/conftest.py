from flask import Flask
from flask.testing import FlaskCliRunner, FlaskClient
import pytest

from app import create_app


import sys

sys.path.append("..")


@pytest.fixture
def app():
    app = create_app()
    app.config.update(
        TESTING=True,
    )
    yield app


@pytest.fixture
def client(app: Flask) -> FlaskClient:
    return app.test_client()


@pytest.fixture
def runner(app: Flask) -> FlaskCliRunner:
    return app.test_cli_runner()
