import pytest
import os
import sys
from unittest.mock import MagicMock

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

@pytest.fixture
def mock_env(monkeypatch):
    monkeypatch.setenv("POSTGRES_USER", "test_user")
    monkeypatch.setenv("POSTGRES_PASSWORD", "test_pass")
    monkeypatch.setenv("POSTGRES_DB", "test_db")
    monkeypatch.setenv("POSTGRES_HOST", "localhost")
    monkeypatch.setenv("POSTGRES_PORT", "5432")
    monkeypatch.setenv("AZURE_AD_CLIENT_ID", "fake_client_id")
    monkeypatch.setenv("AZURE_AD_TENANT_ID", "fake_tenant_id")
    monkeypatch.setenv("AZURE_AD_CLIENT_SECRET", "fake_secret")
    monkeypatch.setenv("GOOGLE_API_KEY", "fake_google_key")

@pytest.fixture
def mock_db_session():
    session = MagicMock()
    return session
