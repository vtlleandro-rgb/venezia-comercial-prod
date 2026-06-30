# Brainstorm de Design — Residencial Venezia

## Contexto
Site comercial premium para equipe de vendas e gestão comercial do Residencial Venezia, ARTEÁ Empreendimentos. Deve seguir o padrão do Villa Di Napoli (single-page com navegação lateral, seções modulares, tabela de preços, simulador, área do corretor).

---

<response>
<text>
## Ideia 1 — Neoclássico Veneziano Contemporâneo

**Design Movement**: Neo-classical minimalism com referências à arquitetura veneziana — arcos sutis, proporções áureas, elegância atemporal.

**Core Principles**:
1. Simetria e proporção como linguagem visual
2. Materiais nobres digitais (texturas de mármore, dourado fosco)
3. Hierarquia tipográfica dramática com serifas clássicas
4. Espaço negativo generoso como símbolo de exclusividade

**Color Philosophy**: Paleta baseada em tons de grafite profundo (#1a1a2e), branco marfim (#fafaf5), e acentos em verde italiano (#1b5e20) e vermelho vinho (#8b1a1a) — remetendo à bandeira italiana e à sofisticação da marca.

**Layout Paradigm**: Single-page com navegação lateral fixa (sidebar esquerda) e conteúdo em full-width sections com transições verticais suaves. Cada seção ocupa viewport inteira com scroll snap.

**Signature Elements**: 
1. Linhas finas douradas como separadores
2. Cards com bordas arredondadas mínimas e sombras profundas
3. Gôndola estilizada como elemento decorativo sutil

**Interaction Philosophy**: Movimentos lentos e elegantes — parallax sutil, fade-ins com timing longo (400-600ms), hover states com elevação suave.

**Animation**: Scroll-triggered reveals com easing cubic-bezier(0.23, 1, 0.32, 1), parallax em imagens hero, counter animations nos indicadores financeiros.

**Typography System**: Playfair Display para títulos (peso 700-900), DM Sans para corpo (peso 400-500), espaçamento entre letras generoso nos subtítulos.
</text>
<probability>0.08</probability>
</response>

---

<response>
<text>
## Ideia 2 — Executive Dark Dashboard

**Design Movement**: Dark-mode executive interface — inspirado em dashboards financeiros premium (Bloomberg Terminal meets luxury real estate).

**Core Principles**:
1. Fundo escuro como canvas de autoridade
2. Dados como protagonistas visuais
3. Contraste extremo para legibilidade
4. Microinterações que comunicam precisão

**Color Philosophy**: Base em grafite escuro (#0f0f14), cards em cinza carvão (#1c1c24), acentos em vermelho ARTEÁ (#e63946) e verde sucesso (#2ecc71). Texto em branco puro e cinza claro (#e0e0e0).

**Layout Paradigm**: Grid assimétrico com sidebar de navegação à esquerda (compacta, com ícones), conteúdo principal em cards modulares que se adaptam ao viewport.

**Signature Elements**:
1. Glassmorphism sutil nos cards (backdrop-blur)
2. Indicadores com glow vermelho/verde
3. Gradientes sutis nos backgrounds de seção

**Interaction Philosophy**: Respostas instantâneas — hover com scale(1.02) em 150ms, tooltips rápidos, transições de tab sem delay perceptível.

**Animation**: Stagger reveals em listas (30ms delay), counters animados em números financeiros, progress bars com easing suave, gráficos com draw-in animation.

**Typography System**: Space Grotesk para títulos (geométrica, moderna), Inter para dados/corpo, monospace (JetBrains Mono) para valores financeiros.
</text>
<probability>0.05</probability>
</response>

---

<response>
<text>
## Ideia 3 — Italian Luxury Minimal (Escolhida)

**Design Movement**: Minimalismo italiano de luxo — inspirado em marcas como Armani Casa e Poliform. Clean, sofisticado, com materiais premium e espaço respirável.

**Core Principles**:
1. Menos é mais — cada elemento tem propósito
2. Fundo claro com profundidade através de sombras e layers
3. Fotografia como elemento hero dominante
4. Tipografia como arte — contraste entre display e body

**Color Philosophy**: Base branca (#ffffff) com off-white (#f8f7f4) para seções alternadas, grafite (#2d2d2d) para textos, acentos em vermelho ARTEÁ (gradient de #e63946 para #c2185b) usado com parcimônia em CTAs e destaques. Verde italiano (#1b5e20) e vermelho (#c62828) como referências sutis à bandeira.

**Layout Paradigm**: Single-page vertical com navegação lateral fixa à esquerda (estilo Villa Di Napoli). Seções em full-width com padding generoso. Grid de 12 colunas com conteúdo centrado em max-width 1280px. Imagens em aspect-ratio 16:9 ou full-bleed.

**Signature Elements**:
1. Linha fina verde-branco-vermelho (bandeira italiana) como separador temático
2. Cards com sombra suave e hover elevation
3. Números grandes em destaque (estilo editorial) para dados financeiros

**Interaction Philosophy**: Elegância contida — transições suaves de 200-300ms, hover states com opacity e translate sutil, scroll animations que revelam conteúdo progressivamente sem exagero.

**Animation**: 
- Fade-up (translateY 20px → 0) com opacity para entrada de seções
- Scale sutil (0.98 → 1) em cards no hover
- Counter animation para valores financeiros
- Smooth scroll entre seções
- Stagger de 50ms em grids de cards

**Typography System**: Cormorant Garamond para títulos (elegante, serifada, peso 600-700), Outfit para corpo e UI (geométrica, limpa, peso 300-500). Números em Outfit weight 600 para destaque.
</text>
<probability>0.07</probability>
</response>

---

## Decisão: Ideia 3 — Italian Luxury Minimal

Escolhi esta abordagem por alinhar-se perfeitamente ao conceito do Residencial Venezia (referência italiana), à identidade da ARTEÁ (vermelho/magenta premium), e ao padrão já estabelecido no Villa Di Napoli (navegação lateral, single-page, seções modulares). O fundo claro com tipografia serifada elegante transmite sofisticação sem pesar, ideal para um material comercial de vendas.
