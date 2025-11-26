import os
from pathlib import Path
from dotenv import load_dotenv

# Determine the project root (antigravidade/backend)
# __file__ = backend/app/core/config.py
# parent = backend/app/core
# parent.parent = backend/app
# parent.parent.parent = backend
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
PROJECT_ROOT = BACKEND_DIR.parent  # antigravidade

# Load .env from project root or parent directories
# We look for .env in the current directory, then up the tree
load_dotenv(PROJECT_ROOT / ".env")
load_dotenv(PROJECT_ROOT.parent / ".env") # Fallback to Aido root

class Settings:
    PROJECT_NAME: str = "Aido Document Editor"
    API_V1_STR: str = "/api"
    
    # Base Paths (Dynamic)
    BASE_DIR: Path = BACKEND_DIR
    
    # Data Directories (Defaults relative to project if not in env)
    # If AIDO_INPUT_DIR is set in .env, use it. Otherwise default to a local 'data/input'
    AIDO_INPUT_DIR: Path = Path(os.getenv("AIDO_INPUT_DIR", BASE_DIR / "data" / "input"))
    AIDO_OUTPUT_DIR: Path = Path(os.getenv("AIDO_OUTPUT_DIR", BASE_DIR / "data" / "output"))
    AIDO_TEMPLATES_DIR: Path = Path(os.getenv("AIDO_TEMPLATES_DIR", BASE_DIR / "templates"))
    
    # Whisper
    WHISPER_MODEL: str = os.getenv("AIDO_WHISPER_MODEL", "tiny")
    WHISPER_DEVICE: str = os.getenv("AIDO_WHISPER_DEVICE", "cpu")
    WHISPER_COMPUTE: str = os.getenv("AIDO_WHISPER_COMPUTE", "int8")
    
    # Google
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY")

settings = Settings()
