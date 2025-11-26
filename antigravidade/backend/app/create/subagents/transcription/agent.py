from google.adk.agents import Agent

from .tools.transcribe_video import transcribe_video


# Passo 1 do Pipeline: Transcricao
transcription_agent = Agent(
    name="TranscriptionAgent",
    model="gemini-2.5-flash",
    description="Converte o audio do video fornecido pelo usuario em texto bruto.",
    tools=[transcribe_video],
    instruction=(
        "O usuario informou o caminho completo do arquivo de video na mensagem inicial. "
        "Chame a ferramenta `transcribe_video`, passando exatamente esse caminho como argumento "
        "`video_path`. Sua UNICA resposta deve ser o texto bruto retornado pela ferramenta, "
        "sem qualquer comentario ou formatacao adicional."
    ),
    output_key="transcribed_text",
)


__all__ = ["transcription_agent"]
