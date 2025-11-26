from google.adk.agents import Agent
from pydantic import BaseModel, Field


class StructuredManual(BaseModel):
    """Estrutura padrao usada pelos agentes de estruturacao e revisao."""

    titulo: str = Field(description="Titulo claro e conciso para o manual.")
    assunto: str = Field(description="Tema geral do manual originado do contexto.")
    responsavel: str = Field(description="Area ou pessoa responsavel, ou 'N/A' quando nao identificado.")
    resumo: str = Field(description="Resumo curto com proposito e resultado do processo.")
    palavras_chave: str = Field(description="Lista textual com 5 a 7 palavras-chave separadas por virgula.")
    introducao: str = Field(description="Introducao que contextualiza importancia e aplicacao do manual.")
    objetivo: str = Field(description="Objetivo principal a ser atingido ao seguir o manual.")
    passo_a_passo: str = Field(description="Passos numerados em uma unica string; use '\\n' para novas linhas.")
    checks_qualidade: str = Field(description="Checklist com bullets em uma unica string; use '\\n' para novas linhas.")


structuring_agent = Agent(
    name="StructuringAgent",
    model="gemini-2.5-flash",
    description="Transforma a transcricao bruta em dados estruturados para o manual.",
    instruction="""
Voce eh um analista de processos senior.
Analise a transcricao do video e reorganize as informacoes em um objeto JSON.

Transcricao:
---
{{transcribed_text}}
---

Retorne apenas um JSON com as chaves:
- titulo
- assunto
- responsavel
- resumo
- palavras_chave
- introducao
- objetivo
- passo_a_passo
- checks_qualidade

Regras adicionais:
- Preencha `passo_a_passo` como uma lista numerada em Markdown (ex.: "1. Passo...\\n2. Passo...").
- Preencha `checks_qualidade` como uma lista com marcadores em Markdown (ex.: "- Verificacao...").
- Nao adicione sub_etapas ou campos extras; utilize somente as chaves especificadas.

🧠 Observacao Final sobre o Formato da Resposta

Adote a personalidade de um "Tutor Pedagogico" ao estruturar sua resposta. O objetivo eh facilitar o aprendizado, tornando os insights mais didaticos, aplicaveis e envolventes. Siga estas diretrizes:

    Didatica e Visual:

        Use Markdown para organizar o conteudo com clareza, incluindo:

            Titulos e subtitulos bem definidos

            Listas numeradas ou com marcadores

            Tabelas comparativas quando aplicavel

    Amigavel e Leve:

        Insira emojis contextuais (como 🚀, 📊, 💡, 🧩) para facilitar a leitura e transmitir o tom certo.

    Clareza na Linguagem:

        Destaque conceitos-chave em negrito para facilitar a assimilacao rapida.

    Explicacoes com Analogias:

        Sempre que abordar um conceito complexo, crie uma analogia simples que o torne mais acessivel, como se explicasse a alguem curioso, mas leigo.
""".strip(),
    output_key="structured_data",
)


__all__ = ["structuring_agent", "StructuredManual"]
