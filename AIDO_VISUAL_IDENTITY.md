# AIDO_VISUAL_IDENTITY.md

## 1. Filosofia de Design: "O Profissional Confiante"

### Conceito Chave
A interface não é uma ferramenta de TI, mas um assistente digital para a área de finanças. O design deve ser minimalista, sem distrações, e passar uma sensação de robustez e confiabilidade.

### Inspiração
Uma fusão entre a engenharia alemã da Bosch (precisão, funcionalidade) e a estética limpa de startups de IA do Vale do Silício (simplicidade, foco no fluxo).

### Princípios
- **Clareza Acima de Tudo**: O usuário nunca deve se sentir perdido.
- **Feedback Constante**: O sistema deve sempre comunicar o que está fazendo (ex: etapas do pipeline, status).
- **Estética Funcional**: Cada elemento de design deve ter um propósito, não apenas decorar.

---

## 2. Paleta de Cores (Color Palette)

### Primário (Ação e Identidade)
- **boschBlue**: `#005691` (Usado em botões principais, links ativos, headers de seção).

### Sotaque & Gráficos
- **boschLightBlue**: `#008ECF` (Gradientes, elementos sutis de destaque).

### Neutros (Estrutura e Conteúdo)
- **darkGray**: `#1C1C1C` (Texto principal, para máxima legibilidade).
- **midGray**: `#87909C` (Texto secundário, placeholders).
- **lightGray**: `#EFF1F3` (Fundos de seções e painéis).
- **white**: `#FFFFFF` (Cor base para "folhas de papel" e painéis de conteúdo).

### Semântico (Status)
- **success**: `#78BE20` (Indicadores de sucesso, como "Concluído").
- **error**: `#E20015` (Mensagens de erro).

### Supergraphic
O gradiente icônico da Bosch deve ser utilizado no cabeçalho como uma assinatura de marca, reforçando a identidade visual sem sobrecarregar o conteúdo.

```css
/* Exemplo de uso de variáveis CSS */
:root {
  --bosch-blue: #005691;
  --bosch-light-blue: #008ECF;
  --dark-gray: #1C1C1C;
  --mid-gray: #87909C;
  --light-gray: #EFF1F3;
  --white: #FFFFFF;
  --success: #78BE20;
  --error: #E20015;
}
```

---

## 3. Tipografia: Bosch Office Sans

### Fonte Principal
A fonte **Bosch Office Sans** (ou, como fallback, um sans-serif moderno como 'Inter') é usada em toda a interface para garantir consistência e legibilidade.

### Hierarquia
- **H1 (Títulos de Página/Editor)**: `text-xl`, `font-bold`. Cor: `#1C1C1C`.
- **H3 (Títulos de Seção/Sidebar)**: `text-[10px]`, `font-bold`, `uppercase`, `tracking-widest`. Cor: `#005691` ou `text-gray-500`.
- **Corpo de Texto**: `text-sm` ou `11pt` no editor, cor `#1C1C1C`.
- **Texto Secundário**: `text-xs` ou `text-[9px]`, cor `text-gray-500`.
- **Monoespaçado (Para IDs, Códigos)**: `font-mono` ('JetBrains Mono'), para diferenciar dados técnicos.

```css
/* Exemplo de Font Family */
body {
  font-family: 'Bosch Office Sans', 'Inter', sans-serif;
}

.code-snippet {
  font-family: 'JetBrains Mono', monospace;
}
```

---

## 4. Componentes Chave e sua Lógica de Design (Component System)

### Layout Principal (`Layout.tsx`)
- **Estrutura**: Um layout de 3 colunas (Sidebar, Painel de Artefatos, Editor) com um cabeçalho fixo.
- **Header**: Contém a identidade visual (Logo Aido, Logo Bosch), navegação principal e perfil do usuário. A barra "Supergraphic" no fundo do header ancora a identidade da marca.
- **Sidebar ("Equipe")**: Fundo branco, com divisórias sutis. Utiliza avatares (ui-avatars.com) e nomes completos. Serve para contextualizar o ambiente de equipe. Oculta detalhes quando recolhida, mostrando apenas avatares.

### Editor de Manual (`ManualEditor.tsx`)
- **Conceito "A Folha de Papel"**: O editor é desenhado para se assemelhar a uma folha A4 (`max-w-[210mm]`, `min-h-[297mm]`) com sombra (`shadow-lg`) sobre um fundo de cor neutra, focando a atenção do usuário no documento.
- **Assinatura Visual**: A faixa gradiente azul no topo do "papel" serve como um cabeçalho visual que quebra a monotonia sem distrair.
- **WYSIWYG (What You See Is What You Get)**: O usuário edita o texto visualmente formatado (HTML), não o Markdown bruto, para uma experiência intuitiva. A conversão de/para Markdown é uma função técnica de fundo, invisível para o usuário.

### Botões (`Button.tsx`)
- **Estilo Industrial**: Levemente arredondados (`rounded-sm`), sem bordas exageradas, com feedback tátil sutil (`active:scale-[0.98]`).
- **Hierarquia Visual**: O botão de ação primária (ex: "Download DOCX") usa a cor `boschBlue` para se destacar. Ações secundárias são brancas ou contornadas.

---

## 5. Prompt de Geração de Imagem (Para Replicar o Estilo)

Use este prompt para gerar imagens de fundo ou banners no mesmo estilo:

> "A professional and clean corporate brand identity document for a high-tech AI application named Aido, inspired by Bosch's design system. Features a minimalist aesthetic with a color palette of Bosch blue (#005691), technical grays, and crisp white. The layout uses dot grids and subtle gradients. The typography is a modern sans-serif font. The overall feel is one of precision, confidence, and innovation. –style raw –s 750"
