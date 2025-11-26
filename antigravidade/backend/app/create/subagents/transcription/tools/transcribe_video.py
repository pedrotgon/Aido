import asyncio
import os
from faster_whisper import WhisperModel

# Define base paths relative to this file
# File is in: backend/app/create/subagents/transcription/tools/
# Project root (antigravidade) is 6 levels up
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, "../../../../../../"))
data_dir = os.path.join(project_root, "data")

TRANSCRIPTION_CACHE_DIR = os.path.join(data_dir, "saida", "txt")
os.makedirs(TRANSCRIPTION_CACHE_DIR, exist_ok=True)


def _run_transcription_sync(video_path: str) -> tuple:
    model = WhisperModel("tiny", device="cpu", compute_type="int8")
    segments, info = model.transcribe(video_path, beam_size=5)
    return segments, info


async def transcribe_video(video_path: str) -> str:
    print(f"--- TOOL: Requesting transcription for {video_path} ---")

    allowed_directory = os.path.join(data_dir, "entrada")
    video_abs_path = os.path.abspath(video_path)

    # Normalize case for Windows comparison
    if not os.path.normcase(video_abs_path).startswith(os.path.normcase(allowed_directory)):
        error_msg = f"Security Error: Path '{video_path}' is outside the allowed directory."
        print(f"--- TOOL ERROR: {error_msg} ---")
        return f"Error: {error_msg}"

    if not os.path.exists(video_path):
        error_msg = f"Video file not found at {video_path}"
        print(f"--- TOOL ERROR: {error_msg} ---")
        return f"Error: {error_msg}"

    video_filename_stem = os.path.splitext(os.path.basename(video_path))[0]
    cache_filename = f"{video_filename_stem}_transcricao.txt"
    cache_file_path = os.path.join(TRANSCRIPTION_CACHE_DIR, cache_filename)

    if os.path.exists(cache_file_path):
        print(f"--- TOOL: Cache hit! Reading transcription from {cache_file_path} ---")
        try:
            with open(cache_file_path, "r", encoding="utf-8") as file:
                return file.read()
        except Exception as exc:
            print(f"--- TOOL WARNING: Could not read cache file. Retranscribing. Error: {exc} ---")

    print(f"--- TOOL: No cache found. Initializing transcription with retry logic. ---")
    max_retries = 3
    base_delay = 1

    for attempt in range(max_retries):
        try:
            segments, info = await asyncio.to_thread(_run_transcription_sync, video_path)
            print(f"--- TOOL: Detected language '{info.language}' with probability {info.language_probability:.2f} ---")
            transcribed_text = "".join(segment.text for segment in segments).strip()

            print(f"--- TOOL: Transcription successful. Saving to cache at {cache_file_path} ---")
            with open(cache_file_path, "w", encoding="utf-8") as file:
                file.write(transcribed_text)

            return transcribed_text

        except Exception as exc:
            print(f"--- TOOL WARNING: Attempt {attempt + 1} of {max_retries} failed. Error: {exc} ---")
            if attempt + 1 == max_retries:
                error_message = f"An unexpected error occurred after {max_retries} attempts: {exc}"
                print(f"--- TOOL ERROR: {error_message} ---")
                return f"Error: {error_message}"

            delay = base_delay * (2**attempt)
            print(f"--- TOOL: Retrying in {delay} seconds... ---")
            await asyncio.sleep(delay)
