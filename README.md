# Aido - Automação Inteligente de Documentos

**Bem-vindo ao Aido!**

O Aido é uma ferramenta inteligente que ajuda você a transformar vídeos, gravações de reuniões ou textos brutos em **documentos oficiais formatados** (manuais, relatórios) automaticamente.

Ele "assiste" ao vídeo, entende o que foi feito, escreve um manual técnico profissional e pode até traduzi-lo para Inglês, Alemão ou Espanhol — tudo em segundos.

---

## 🚀 Como Usar (Jeito Mais Fácil - Sem Instalar Nada)

A maneira mais simples de usar o Aido é através do **GitHub Codespaces**. Isso roda o sistema em um computador na nuvem, então você não precisa instalar programas complexos no seu notebook de trabalho.

### Passo 1: Acessar o Sistema
1.  Acesse o link do projeto: [https://github.com/pedrotgon/Aido](https://github.com/pedrotgon/Aido)
2.  Clique no botão verde **"<> Code"**.
3.  Selecione a aba **"Codespaces"**.
4.  Clique no botão verde **"Create codespace on main"**.

> *Uma tela preta (terminal) vai abrir e carregar por alguns minutos. Isso é normal, ele está ligando o "computador virtual".*

### Passo 2: Configuração Inicial (Só na primeira vez)
Quando o sistema carregar, você verá uma tela dividida. Na parte de baixo, há uma janela chamada "Terminal". Copie e cole os comandos abaixo, um bloco de cada vez, e aperte **Enter**:

**1. Instalar ferramentas de áudio:**
```bash
sudo apt-get update && sudo apt-get install -y ffmpeg
```

**2. Preparar o cérebro do sistema (Python):**
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r antigravidade/requirements.txt
```

**3. Configurar a Chave de Acesso (Senha):**
Você precisa dizer ao sistema qual a senha para usar a Inteligência Artificial.
*   No menu lateral esquerdo de arquivos, clique com o botão direito na pasta `antigravidade` e escolha "New File" (Novo Arquivo).
*   Dê o nome `.env`.
*   Abra esse arquivo e cole sua chave:
    `GOOGLE_API_KEY=sua_chave_aqui`
*   Salve (Ctrl+S).

**4. Preparar a Tela (Frontend):**
Volte ao terminal e digite:
```bash
cd antigravidade/ui
npm install
```

### Passo 3: Rodar o Aido
Agora que tudo está pronto, você precisa "ligar" o sistema. Você precisará de **dois terminais** (clique no `+` no canto do terminal para abrir outro).

**No Terminal 1 (O Cérebro):**
```bash
# Se necessário, ative o ambiente: source .venv/bin/activate
uvicorn antigravidade.backend.app.server:app --reload --host 0.0.0.0 --port 8000
```

**No Terminal 2 (A Tela):**
```bash
cd antigravidade/ui
npm run dev -- --host
```

### Passo 4: Abrir o Site
1.  Procure pela aba **"PORTS"** (Portas) perto do terminal.
2.  Encontre a linha que diz **"Local Address: 5173"** (ou 3000).
3.  Clique no ícone do **Globo (Open in Browser)** que aparece ao passar o mouse.
4.  Pronto! O Aido abrirá em uma nova aba do seu navegador.

---

## 📖 Guia Rápido de Uso

1.  **Início:** Na tela inicial, clique em **"Novo Documento"**.
2.  **Upload:**
    *   **Título:** Dê um nome ao seu manual.
    *   **Mídia:** Escolha o vídeo ou áudio que você gravou.
    *   **Template (Opcional):** Se tiver um modelo Word (`.docx`) da Bosch, envie aqui. Se não, o Aido cria um padrão para você.
    *   **Idioma:** Escolha em qual língua você quer o manual final (Português, Inglês, Alemão, Espanhol).
    *   **Instruções:** Se quiser, dê dicas para a IA (ex: "Foque na segurança").
3.  **Processamento:** Clique em **"Iniciar Pipeline"**. Acompanhe o progresso na tela.
4.  **Edição e Download:**
    *   Quando terminar, o manual aparecerá na tela.
    *   Você pode ler e editar o texto se quiser mudar algo.
    *   Clique em **"Download DOCX"** para baixar o arquivo Word finalizado no seu computador.

---

## 💻 Instalação Local (Para TI ou Usuários Avançados)

Se você preferir rodar no seu próprio PC (Windows), siga estes passos.

### Pré-requisitos
*   Python 3.10+
*   Node.js 18+
*   FFmpeg (instalado e configurado no PATH do Windows)

### Instalação
1.  Clone este repositório.
2.  **Backend:**
    ```powershell
    python -m venv .venv
    .venv\Scripts\activate
    pip install -r antigravidade/requirements.txt
    ```
3.  **Frontend:**
    ```powershell
    cd antigravidade/ui
    npm install
    ```
4.  **Configuração:** Crie o arquivo `.env` com a `GOOGLE_API_KEY`.

### Execução
Utilize o `Makefile` na raiz (requer `make` instalado ou rode os comandos manualmente):
*   `make dev-backend`
*   `make dev-frontend`