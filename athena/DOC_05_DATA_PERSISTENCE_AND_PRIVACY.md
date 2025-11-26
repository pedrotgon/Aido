# Athena Doc 5: Persistência de Dados e Privacidade em IA Generativa

## 1. O Mito do "Vazamento por Treinamento"

Uma das maiores preocupações de lideranças ao adotar IA Generativa é: **"Se eu enviar meus dados para a IA, ela vai aprender com eles e vazar meus segredos para concorrentes?"**

No contexto do Aido e do **Google Gemini Enterprise**, a resposta é um categórico **NÃO**.

### Como Funciona o "Aprendizado" da IA (e por que seus dados estão seguros)

Modelos de IA como o Gemini são treinados em duas fases distintas:
1.  **Pré-Treinamento (A Fase de Aprendizado):** O modelo "lê" a internet inteira (bilhões de páginas) para aprender a falar, raciocinar e entender o mundo. Isso acontece **uma vez**, nos servidores da Google, antes do produto ser lançado.
2.  **Inferência (A Fase de Uso - Onde o Aido opera):** Quando o Aido envia um texto para o Gemini resumir ou traduzir, o modelo está "congelado". Ele usa seu conhecimento prévio para processar sua solicitação, mas **não retém a informação nova**. É como pedir para um tradutor juramentado traduzir um contrato: ele lê, traduz e devolve, mas não guarda uma cópia nem usa aquilo para escrever o livro dele.

**Garantia Contratual (Google Cloud AI):**
Os termos de serviço da API Enterprise (usada pelo Google ADK) garantem legalmente que **"Inputs e Outputs NÃO são usados para treinar os modelos base da Google"**. Seus dados são seus.

---

## 2. Onde Estão os Dados do Aido? (Persistência)

Para auditoria e compliance, é crucial saber onde cada bit de informação reside fisicamente. O Aido opera em um modelo híbrido de **Alta Privacidade**.

### A. Dados de Mídia (Vídeo/Áudio) - Nível Máximo de Segurança
*   **Onde ficam:** Exclusivamente no **Servidor Local** do Aido (On-Premise/Notebook do usuário).
*   **Onde são processados:** Pelo motor **Faster-Whisper** rodando na CPU local.
*   **Risco de Vazamento:** **Nulo**. O arquivo de vídeo nunca trafega pela internet. Ele nunca sai da infraestrutura da Bosch.

### B. Dados de Texto (Transcrições e Manuais) - Nível Alto de Segurança
*   **Onde ficam:**
    *   **Armazenamento Definitivo:** Nos arquivos `.txt` e `.docx` salvos no disco rígido do servidor local (`antigravidade/data/saida/`).
    *   **Armazenamento Temporário:** Na memória RAM do servidor enquanto a edição está ativa. Se o servidor reiniciar, edições não salvas (não baixadas) são descartadas.
*   **Processamento Cognitivo:** Apenas o **texto transcrito** (anonimizado, sem o áudio original) é enviado para a API do Google Gemini para estruturação e tradução.
*   **Criptografia:** Todo o tráfego para a nuvem Google é criptografado via **TLS/SSL (HTTPS)**.

---

## 3. Matriz de Ciclo de Vida do Dado (Data Lifecycle)

| Tipo de Dado | Ingestão | Processamento | Armazenamento | Descarte |
| :--- | :--- | :--- | :--- | :--- |
| **Vídeo Bruto** | Upload Local | Extração de Áudio (FFmpeg) | Disco Local (Temp) | Mantido no servidor local (não sobe p/ nuvem) |
| **Áudio** | Extraído do Vídeo | Transcrição (Whisper Local) | Memória RAM (Temp) | Deletado após transcrição |
| **Texto Transcrito** | Saída do Whisper | Estruturação (Gemini API) | Disco Local (`.txt`) | Arquivado localmente |
| **Manual Final** | Saída do Gemini | Formatação Word (Python) | Disco Local (`.docx`) | Arquivado localmente |
| **Edições de Usuário** | Input na Interface | Renderização na Tela | Memória RAM | Perdido no restart (Se não baixado) |

---

## 4. Conclusão Executiva

O Aido foi arquitetado seguindo o princípio de **"Minimum Data Exposure"** (Exposição Mínima de Dados).

1.  **Segregação:** O "pesado" e sensível (vídeo/voz) fica em casa. Apenas o "leve" e necessário (texto) viaja para a nuvem para inteligência.
2.  **Volatilidade:** O sistema não cria um "banco de dados secreto" com seus manuais na nuvem. A "memória" do editor é volátil; o produto final é um arquivo físico (`.docx`) sob sua custódia total.
3.  **Soberania:** A Bosch mantém a posse total dos artefatos gerados. A IA é apenas uma ferramenta de processamento, não um repositório.

Esta arquitetura blinda a organização contra vazamentos massivos e garante conformidade com normas rígidas de proteção de dados.
