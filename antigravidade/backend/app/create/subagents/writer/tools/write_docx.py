import asyncio
import json
import os
from typing import Any, Dict

from docxtpl import DocxTemplate


def _write_docx_sync(structured_data: str, template_path: str, output_dir: str) -> Dict[str, Any]:
    try:
        # Calculate project root dynamically
        # File is in: backend/app/create/subagents/writer/tools/
        current_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.abspath(os.path.join(current_dir, "../../../../../../"))
        
        allowed_output_dir = os.path.join(project_root, "data", "saida", "docx")
        allowed_template_dir = os.path.join(project_root, "templates")
        
        output_dir_abs = os.path.abspath(output_dir)
        template_path_abs = os.path.abspath(template_path)

        # Use normcase for Windows case-insensitive comparison
        if not os.path.normcase(output_dir_abs).startswith(os.path.normcase(allowed_output_dir)):
            return {"status": "error", "message": f"Security Error: Output directory '{output_dir}' is not allowed."}

        if not os.path.normcase(template_path_abs).startswith(os.path.normcase(allowed_template_dir)):
            return {"status": "error", "message": f"Security Error: Template path '{template_path}' is not allowed."}

        if not os.path.exists(template_path):
            return {"status": "error", "message": f"Template file not found at {template_path}"}

        os.makedirs(output_dir, exist_ok=True)
        doc = DocxTemplate(template_path)
        context = json.loads(structured_data)
        doc.render(context)

        title = context.get("titulo") or context.get("title") or "Generated_Manual"
        safe_filename = "".join(char for char in title if char.isalnum() or char in (" ", "-")).rstrip()
        output_filename = safe_filename.replace(" ", "_") + ".docx"
        output_path = os.path.join(output_dir, output_filename)
        doc.save(output_path)

        return {"status": "success", "output_path": output_path}

    except json.JSONDecodeError:
        return {"status": "error", "message": "Input data was not valid JSON."}
    except Exception as exc:
        return {"status": "error", "message": f"An unexpected error occurred: {exc}"}


async def write_docx(structured_data: str, template_path: str, output_dir: str) -> Dict[str, Any]:
    print("--- TOOL: Initializing .docx generation ---")

    result = await asyncio.to_thread(
        _write_docx_sync,
        structured_data,
        template_path,
        output_dir,
    )

    if result["status"] == "success":
        print(f"--- TOOL: Successfully generated document at {result['output_path']} ---")
    else:
        print(f"--- TOOL ERROR: {result['message']} ---")

    return result
