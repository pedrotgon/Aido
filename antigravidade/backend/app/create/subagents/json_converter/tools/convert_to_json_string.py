import json
from typing import Any


def convert_to_json_string(data: Any) -> str:
    try:
        if isinstance(data, str):
            data = json.loads(data)
        elif hasattr(data, "model_dump"):
            data = data.model_dump()

        return json.dumps(data, ensure_ascii=False, indent=4)
    except json.JSONDecodeError as exc:
        return f"Error converting data to JSON string: invalid JSON input ({exc})"
    except TypeError as exc:
        return f"Error converting data to JSON string: unsupported type ({exc})"
    except Exception as exc:  # pragma: no cover - safeguard
        return f"Error converting data to JSON string: {exc}"
