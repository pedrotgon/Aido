# Aido - Automação Inteligente de Documentos

**Aido** é uma plataforma de orquestração de agentes de IA projetada para transformar conteúdo audiovisual bruto (vídeos técnicos, reuniões) em documentação corporativa estruturada, formatada e traduzida automaticamente.

O sistema utiliza o **Google ADK (Agent Development Kit)** para raciocínio cognitivo e **FasterWhisper** para transcrição neural local.

## Estrutura do Projeto

```
aido/
├── antigravidade/
│   ├── backend/       # API Python (FastAPI + ADK)
│   ├── ui/            # Frontend React (Vite + Tailwind)
│   ├── data/          # Armazenamento local de mídia e artefatos
│   └── templates/     # Templates DOCX (Padrão Bosch)
├── Makefile           # Comandos de automação
└── README.md          # Este arquivo
```

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

1.  **Python 3.10+**
2.  **Node.js 18+**
3.  **FFmpeg** (Adicionado ao PATH do sistema para processamento de áudio)

## Instalação

1.  **Configurar o Backend:**
    ```bash
    # Criar ambiente virtual (recomendado)
    python -m venv .venv
    
    # Ativar ambiente (Windows)
    .venv\Scripts\activate
    
    # Instalar dependências
    pip install -r antigravidade/requirements.txt
    ```

2.  **Configurar Variáveis de Ambiente:**
    Crie um arquivo `.env` na raiz ou em `antigravidade/.env` com sua chave da API do Google (necessária para o Gemini):
    ```env
    GOOGLE_API_KEY=sua_chave_aqui
    ```

3.  **Configurar o Frontend:**
    ```bash
    cd antigravidade/ui
    npm install
    ```

## Como Rodar

Utilize o `Makefile` na raiz para facilitar a execução. Você precisará de dois terminais abertos.

### Terminal 1: Backend (API & Agentes)
```bash
make dev-backend
```
*O servidor iniciará em http://localhost:8000*

### Terminal 2: Frontend (Interface do Usuário)
```bash
make dev-frontend
```
*A aplicação abrirá em http://localhost:3000*

## Pipeline de Processamento

O Aido executa um pipeline sequencial:
1.  **Ingestão:** Upload de vídeo/áudio.
2.  **Transcrição (Whisper):** Conversão de áudio para texto com timestamp.
3.  **Estruturação (ADK):** Organização lógica em capítulos.
4.  **Masterização & Tradução (ADK):** Refinamento técnico e tradução para o idioma alvo (PT, EN, DE, ES).
5.  **Publicação:** Geração de arquivo `.docx` formatado seguindo o guia de estilo (Bosch Office Sans).

## Tecnologias

*   **Backend:** FastAPI, Google ADK (Gemini 2.5 Flash), FasterWhisper, Python-Docx.
*   **Frontend:** React, TypeScript, Vite, TailwindCSS, Server-Sent Events (SSE).