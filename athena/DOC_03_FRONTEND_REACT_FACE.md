# Athena Doc 3: A Interface Humana (Frontend React)

## 1. Visão Geral Técnica
O Frontend é a camada de interação. Construído com **React 19** e **Vite**, ele não é apenas uma "tela bonita", mas um sistema de gerenciamento de estado complexo que coordena a comunicação em tempo real com o backend.

A filosofia de design é **"Bosch Professional"**: limpo, funcional, responsivo e acessível.

### Stack Tecnológica
- **Core:** React (TypeScript)
- **Build Tool:** Vite (Ultra-rápido)
- **Estilo:** TailwindCSS (Utilizando cores oficiais da Bosch: Azul `#005691`, Vermelho `#E20015` em acentos)
- **Comunicação:** Fetch API + SSE (Server-Sent Events)

---

## 2. Análise de Código "Linha por Linha" (Funcionamento)

O arquivo central é `ui/App.tsx` e `ui/components/ManualEditor.tsx`.

### O Fluxo de Upload e Pipeline (`App.tsx`)
```typescript
const runSequentialPipeline = async (payload) => {
    // 1. Conexão SSE (Real-Time)
    runPipelineSSE(payload, (eventType, data) => {
        // 2. Feedback Visual Imediato
        if (eventType === 'progress') {
            setPipelineStage(data.stage); // Muda o ícone ativo
            setPipelineProgress(data.progress); // Gira o gráfico de %
        }
        // 3. Transição de Estado (Finalização)
        else if (eventType === 'complete') {
            setDocuments(prev => ... update com conteúdo final ...);
            setPipelineStage(PipelineStage.COMPLETED);
            // A mágica acontece aqui: O componente de Monitoramento desmonta
            // e o Editor aparece instantaneamente.
        }
    });
}
```
1.  **SSE vs Polling:** Não ficamos perguntando "tá pronto?" a cada segundo. Abrimos um canal de escuta. O servidor "empurra" (push) o status. Isso economiza rede e bateria.
2.  **Gestão de Estado:** O React mantém o estado do documento (`documents`) separado do estado de rascunho de edição (`manualDrafts`). Isso garante que se o usuário editar e cancelar, podemos reverter para o original.

### O Editor de Documentos (`ManualEditor.tsx`)
```typescript
const ManualEditor = (...) => {
    // 1. Conversão Markdown -> Visual (WYSIWYG simulado)
    // O backend manda Markdown (# Titulo). O usuário vê texto formatado.
    // Atualmente usamos um textarea estilizado para robustez máxima.
    
    return (
        <div className="...shadow-lg min-h-[297mm]..."> 
            {/* 2. Simulação de Papel A4 */}
            <div className="h-2 w-full bg-gradient-to-r from-[#005691]..."></div>
            {/* Header Azul Bosch */}
            <textarea ... />
        </div>
    )
}
```
1.  **Design System:** O editor não parece um campo de formulário web. Ele tem sombra (`shadow-lg`), proporção física (`min-h-[297mm]` igual a uma folha A4) e a faixa colorida da marca. Isso dá ao usuário a sensação de estar trabalhando no documento final.

---

## 3. Testes e Validação

*   **Teste de Responsividade:** A interface se adapta (o menu lateral colapsa) para telas menores, permitindo uso em tablets em chão de fábrica.
*   **Teste de Carga:** O sistema de lista de usuários (`MOCK_TEAM_MEMBERS`) usa virtualização (scroll nativo) para não travar se tivermos 100 nomes na equipe.
*   **Teste de Upload:** Validamos a aceitação de tipos MIME restritos (apenas `.mp4`, `.mp3`, `.docx`) para evitar envio de arquivos maliciosos (`.exe`).

---

## 4. Análise de Compliance e Riscos (Frontend)

### Risco 1: Cross-Site Scripting (XSS)
*   **Cenário:** O texto gerado pela IA conter um script malicioso `<script>alert('hacked')</script>`.
*   **Mitigação:** O React escapa automaticamente qualquer conteúdo inserido via `{variavel}`. Além disso, o backend gera Markdown, que é texto passivo, não executável.
*   **Status:** Seguro por Design.

### Risco 2: Perda de Dados (Browser Crash)
*   **Cenário:** O usuário edita o manual por 1 hora e fecha a aba sem querer.
*   **Mitigação:** O estado `manualDrafts` está na memória RAM do navegador.
*   **Melhoria Futura (Recomendação):** Implementar `localStorage` ou `IndexedDB` para salvar rascunhos automaticamente no navegador do usuário, persistindo mesmo se o PC desligar.

### Risco 3: Acessibilidade e Usabilidade
*   **Cenário:** Usuário não técnico não entender o que é "JSON" ou "Pipeline".
*   **Compliance (UX Writing):** Traduzimos termos técnicos. "JSON Converter" virou "Formatação Digital". "Nodes" virou "Equipe". Os avisos de erro são amigáveis ("Falha no upload" em vez de "Error 500"). A interface guia o usuário passo a passo.

### Conclusão de Auditoria
O Frontend do Aido prioriza a **Transparência**. O usuário vê exatamente o que está acontecendo (através dos logs e barras de progresso). A interface é "stateless" em relação a dados sensíveis (não armazena senhas permanentemente), delegando a segurança para o backend e o navegador.
