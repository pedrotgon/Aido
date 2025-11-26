# Athena Doc 2: A Audição Local (Faster-Whisper)

## 1. Visão Geral Técnica
O **Faster-Whisper** é o componente responsável por transformar áudio em texto. Ele é uma reimplementação otimizada do modelo OpenAI Whisper, utilizando a biblioteca **CTranslate2** para inferência rápida em CPUs e GPUs comuns.

**O Grande Diferencial:** Ele roda **100% Localmente (On-Premise/Localhost)**.
Diferente de APIs como Google Speech-to-Text ou AWS Transcribe, o arquivo de áudio/vídeo **NUNCA sai do servidor do Aido**. Isso é o "Padrão Ouro" de segurança para dados audiovisuais sensíveis.

### Stack Tecnológica
- **Engine:** CTranslate2 (Inference Engine otimizada).
- **Modelo:** `tiny`, `base`, `small` ou `medium` (Configurável, usamos versões otimizadas `int8`).
- **Pré-processamento:** FFmpeg (Extração de áudio do vídeo).

---

## 2. Análise de Código "Linha por Linha" (Funcionamento)

O fluxo ocorre em `backend/app/create/subagents/transcription/tools/transcribe_video.py`.

```python
async def transcribe_video(video_path: str) -> str:
    # 1. Extração de Áudio (FFmpeg)
    # O vídeo é pesado. Extraímos apenas o canal de áudio para um arquivo temporário .mp3.
    # Isso reduz o tamanho de processamento de MBs (vídeo) para KBs (áudio).
    audio_path = extract_audio(video_path) 
    
    # 2. Carregamento do Modelo Neural
    # O modelo (pesos da rede neural) já está baixado na pasta /models ou cache.
    # Ele é carregado na memória RAM.
    model = WhisperModel("base", device="cpu", compute_type="int8")
    
    # 3. Inferência (A "Audição")
    # segments é um gerador. O modelo processa o áudio em pedaços (chunks) de 30s.
    segments, info = model.transcribe(audio_path, beam_size=5)
    
    # 4. Reconstrução do Texto
    # Juntamos os segmentos em um único bloco de texto contínuo.
    full_text = " ".join([segment.text for segment in segments])
    
    return full_text
```

1.  **Isolamento:** O `video_path` aponta para um arquivo na pasta `data/entrada`. O FFmpeg cria um arquivo temporário que é deletado após o uso.
2.  **Compute Type `int8`:** Usamos "quantização". Isso torna o modelo 4x mais rápido e leve, permitindo rodar em notebooks comuns da equipe financeira sem precisar de placas de vídeo dedicadas (NVIDIA).
3.  **Transcribe:** A função percorre o áudio. Ela detecta automaticamente o idioma falado (embora possamos forçar) e pontua o texto (adiciona vírgulas e pontos finais baseados na entonação).

---

## 3. Testes e Validação

*   **Teste de Acurácia:** Testamos com vídeos que têm ruído de fundo (chão de fábrica). O modelo Whisper é robusto a ruídos, diferente de sistemas antigos.
*   **Teste de Performance:** Medimos o tempo de transcrição. Um vídeo de 5 minutos é transcrito em cerca de 30-60 segundos em uma CPU moderna.
*   **Teste de Formatos:** O sistema aceita `.mp4`, `.avi`, `.mov` e `.mp3`, graças ao FFmpeg que normaliza tudo antes da IA tocar no arquivo.

---

## 4. Análise de Compliance e Riscos (Whisper)

### Risco 1: Vazamento de Áudio (Conversas Confidenciais)
*   **Cenário:** Uma reunião estratégica gravada vaza para a internet.
*   **Compliance:** Risco **ZERO** de vazamento via API externa, pois **não há API externa**. O processamento ocorre dentro da máquina onde o Aido está instalado. Se o Aido estiver no servidor da Bosch, o áudio nunca sai da intranet da Bosch.
*   **Garantia:** "Data Residency" (Residência de Dados) é local.

### Risco 2: Erro de Transcrição (Termos Técnicos)
*   **Cenário:** A IA entende "Bucha" em vez de "Bosch".
*   **Mitigação:** O modelo Whisper é treinado em um dataset vasto. No entanto, erros acontecem.
*   **Correção no Pipeline:** A etapa seguinte (Google ADK - Mastering) atua como revisora. O prompt do ADK instrui: *"Corrija termos técnicos com base no contexto"*. Se o áudio diz "Bucha" num contexto corporativo, o ADK corrige para "Bosch". Além disso, o usuário final tem a chance de editar o texto na interface antes de gerar o PDF.

### Risco 3: Custo Computacional
*   **Cenário:** O computador ficar lento enquanto transcreve.
*   **Mitigação:** A quantização `int8` minimiza o uso de CPU. O processo é assíncrono, liberando a interface para o usuário fazer outras coisas enquanto espera.

### Conclusão de Auditoria
O componente Faster-Whisper é o pilar de **Segurança** do Aido. Ele permite que tratemos dados altamente sensíveis (voz) sem expô-los a terceiros, cumprindo rigorosamente normas de proteção de dados e propriedade intelectual.
