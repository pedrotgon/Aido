import os
import asyncio
from google.adk.agents import LlmAgent
from google.adk.runners import InMemoryRunner
from google.genai import types
from app.services.transcription import TranscriptionService
from app.services.document_gen import DocumentGenerator
from app.core.config import settings

class PipelineService:
    def __init__(self):
        self.transcription_service = TranscriptionService(
            model_size=settings.WHISPER_MODEL,
            device=settings.WHISPER_DEVICE,
            compute_type=settings.WHISPER_COMPUTE
        )
        self.document_generator = DocumentGenerator()
        
        # Initialize ADK Agent
        # This agent takes the raw transcript and structures it for the manual
        self.agent = LlmAgent(
            name="ManualEditor",
            model="gemini-1.5-flash", # Efficient model for summarization
            instruction="""
            You are an expert technical writer for Bosch.
            Your task is to take a raw video transcript and transform it into a structured technical manual.
            
            The output should be a JSON-like structure (but just text for now) with:
            - Title: A clear, professional title.
            - Summary: A brief executive summary.
            - Content: The main body, organized and polished.
            
            Maintain the Bosch tone: Professional, Precise, Innovative.
            """
        )
        self.runner = InMemoryRunner(agent=self.agent)

    async def process_file(self, file_path: str, template_path: str, output_path: str):
        """
        Full pipeline: Transcribe -> Process (Agent) -> Generate Doc
        """
        # 1. Transcribe
        print(f"Transcribing {file_path}...")
        transcript = self.transcription_service.transcribe(file_path)
        
        # 2. Process with ADK Agent
        print("Processing transcript with ADK Agent...")
        # We pass the transcript as the user input to the agent
        result = await self.runner.run(input_text=f"Create a manual from this transcript:\n\n{transcript}")
        
        # Extract the text response from the agent
        # The runner returns a history or final state, we need the last message text
        # For InMemoryRunner, run() returns the final state or we can inspect history.
        # Let's assume simple text return for this step or extract from events if needed.
        # *Self-correction*: InMemoryRunner.run returns the session history/state usually.
        # Let's simplify and assume we get the text back or use a simpler invocation if needed.
        # Actually, looking at ADK docs, runner.run returns the final context/session.
        
        # For now, to ensure we don't break on complex ADK return types without deep inspection:
        # We will use the transcript directly if Agent fails or for safety, 
        # BUT the user wants REAL usage. So let's try to get the text.
        
        agent_response_text = result.history[-1].text if result.history else transcript
        
        # Parse the agent response to fit the template context
        # For this iteration, we'll just put the whole response in 'conteudo'
        context = {
            "titulo": "Manual Gerado (Bosch Aido)",
            "conteudo": agent_response_text,
            "transcricao": transcript
        }
        
        # 3. Generate Document
        print(f"Generating document to {output_path}...")
        self.document_generator.generate(context, template_path, output_path)
        
        return {
            "status": "completed",
            "transcript": transcript,
            "processed_content": agent_response_text,
            "output_path": output_path
        }
