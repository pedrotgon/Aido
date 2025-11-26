import pytest
import os
from pathlib import Path
from app.services.transcription import TranscriptionService
from app.services.document_gen import DocumentGenerator
from app.core.config import settings

# Use paths from settings (which load from .env or defaults)
# We assume the .env provided by the user points to the correct test files
# or that they are placed in the default relative locations.

# For this specific test run, we want to verify the specific files mentioned by the user.
# We will construct the paths dynamically based on the settings.

@pytest.mark.asyncio
async def test_real_transcription_google_adk():
    """
    Test transcription using the configured input directory.
    """
    # Construct path to the specific video file
    video_path = settings.AIDO_INPUT_DIR / "google adk.mp4"
    
    if not video_path.exists():
        pytest.skip(f"Real video file not found at {video_path}")

    service = TranscriptionService(model_size=settings.WHISPER_MODEL, device=settings.WHISPER_DEVICE, compute_type=settings.WHISPER_COMPUTE)
    
    print(f"\nStarting transcription of: {video_path}")
    transcript = service.transcribe(str(video_path))
    
    assert transcript is not None
    assert len(transcript) > 0
    print(f"\nTranscription successful. Length: {len(transcript)} chars.")
    print(f"Snippet: {transcript[:100]}...")

@pytest.mark.asyncio
async def test_real_document_generation():
    """
    Test document generation using the configured template directory.
    """
    template_path = settings.AIDO_TEMPLATES_DIR / "Padronizacao_Manuais.docx"
    output_path = settings.AIDO_OUTPUT_DIR / "docx" / "test_integration_output.docx"
    
    if not template_path.exists():
        pytest.skip(f"Real template file not found at {template_path}")

    generator = DocumentGenerator()
    
    # Context mimicking a real manual
    context = {
        "titulo": "Manual de Teste Real",
        "conteudo": "Este é um teste de geração de documento usando o template oficial.",
        "transcricao": "Texto transcrito de exemplo para validação do template."
    }
    
    # Ensure output directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    print(f"\nGenerating document at: {output_path}")
    generator.generate(context, str(template_path), str(output_path))
    
    assert output_path.exists()
    assert output_path.stat().st_size > 0
    print("\nDocument generation successful.")
