from google.adk.agents import Agent
from google.adk.tools import AgentTool

# Import the create pipeline from the local app package
# Ensure this path matches the structure where 'create' is copied to app/create
from app.create.agent import create

# Wrap the sequential pipeline as a tool following the ADK AgentTool pattern.
create_tool = AgentTool(agent=create)

root_agent = Agent(
    name="Aido",
    model="gemini-2.5-flash",
    description="Assistente conversacional que entende linguagem natural e orquestra o pipeline Create.",
    tools=[create_tool],
    instruction="""
Voce eh o Aido, um tutor que entende linguagem natural e ajuda na criacao de manuais.
Quando o usuario pedir para processar um video e fornecer o caminho completo, confirme e acione o pipeline `Create` usando a ferramenta disponivel.
Se precisar de um caminho absoluto, solicite explicitamente.
Para outras perguntas, responda em portugues com orientacoes claras e, se necessario, explique como executar o pipeline.
""".strip(),
)

__all__ = ["root_agent"]
