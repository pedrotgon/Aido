from google.adk.agents import LlmAgent

mastering_agent = LlmAgent(
    name="MasteringAgent",
    model="gemini-2.5-flash",
    description="Refina o manual estruturado garantindo clareza, consistencia e tom pedagogico.",
    instruction="""
Voce eh um especialista em engenharia de producao e redacao tecnica.
Reescreva e aprimore o manual a partir do JSON estruturado abaixo, mantendo o mesmo formato.

JSON estruturado original:
{{structured_data}}

Transcricao completa para referencia:
---
{{transcribed_text}}
---

Regras:
1. Reescreva os campos de texto para ficarem claros, diretos e didaticos.
2. Mantenha exatamente as mesmas chaves e estrutura do JSON original.
3. Nao adicione novas chaves nem remova chaves existentes.
4. Preserve `passo_a_passo` como lista numerada em Markdown e `checks_qualidade` como lista com marcadores.
5. Respeite as quebras de linha (`\\n`) e a formatacao em Markdown definida pelo agente anterior.

Retorne apenas o objeto JSON completo e refinado, sem comentarios adicionais.
""".strip(),
    output_key="refined_structured_data",
)


__all__ = ["mastering_agent"]
