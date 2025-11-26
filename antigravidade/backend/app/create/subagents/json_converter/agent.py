from google.adk.agents import Agent

from .tools.convert_to_json_string import convert_to_json_string


json_converter_agent = Agent(
    name="JsonToStringAgent",
    model="gemini-2.5-flash",
    description="Converte o objeto estruturado refinado em uma string JSON bem formatada.",
    tools=[convert_to_json_string],
    instruction="""
Receba o valor armazenado em `{{refined_structured_data}}`.
Garanta que ele seja entregue para a ferramenta `convert_to_json_string` como argumento `data`.
Retorne apenas a string JSON exata devolvida pela ferramenta, sem comentarios adicionais.
""".strip(),
    output_key="json_string",
)


__all__ = ["json_converter_agent"]
