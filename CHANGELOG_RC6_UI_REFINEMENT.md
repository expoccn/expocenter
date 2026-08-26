# RC6 — UI Refinement & Brand System

## Objetivo
Aplicar o conceito visual aprovado sobre a RC5 sem alterar contratos, regras operacionais, autenticação ou cálculos do backend.

## Alterações principais

### Identidade Expo
- Sidebar passou a usar a marca enviada pelo cliente, preservada como imagem e convertida somente para fundo transparente.
- Novo asset: `public/expo-center-norte-mark.png`.
- Favicon substituído pela mesma marca Expo (`expo-favicon-32.png`, `favicon.ico`, `apple-touch-icon.png`).
- Logo CCN do rodapé da sidebar permanece o mesmo arquivo já validado: `public/ccn-logo-white.png`.

### Tema claro e escuro
- Novo conjunto de tokens de cor para superfícies, bordas, textos e gráficos.
- Sidebar institucional navy permanece consistente nos dois temas.
- Cards, painéis, tabelas e controles ganharam hierarquia visual mais leve.
- Área útil limitada a `max-w-[1660px]` para reduzir alongamento em telas muito largas.

### Tooltips / hover
- Todos os gráficos Recharts do dashboard passaram a usar `ExpoChartTooltip`.
- Tooltip usa `card/foreground/muted-foreground`, portanto muda automaticamente com o tema.
- Cursor/área de hover dos gráficos também usa tokens do tema.
- Tooltip Radix global trocado de `primary` fixo para `popover`/`popover-foreground`.
- Dropdowns, selects, popovers e hover cards já utilizavam `popover` e permanecem compatíveis.

### Visão Geral
- KPIs mais compactos e hierárquicos.
- Horas dos chillers alteradas para barras horizontais empilhadas.
- Donut de Potável × Reúso ganhou total central e valores/percentuais laterais.
- Segunda faixa reorganizada em Tendência CAG + Consumo por pavilhão + Pontos de atenção.
- Cards de navegação redundantes removidos da home.

### CAG
- Navegação interna convertida para segmented control compacto.
- Chillers usam cards-resumo selecionáveis e gráficos organizados por contexto.
- Bombas e Tendências receberam a mesma linguagem visual.
- Governança técnica preservada em faixa discreta no rodapé.

### Hidrômetros
- Navegação interna alinhada ao novo segmented control.
- Cards, pavilhões e tabela refinados visualmente.
- Mantidos consumo, perfil diário, Potável × Reúso, ranking, janelas e qualidade.

### Qualidade dos Dados
- Resumo reduzido para quatro KPIs principais.
- Cobertura, composição e disponibilidade diária agrupadas na mesma faixa analítica.
- Cards repetitivos por fonte substituídos por tabela detalhada mais densa.
- Regras de qualidade mantidas em bloco separado.

### Relatórios, IA e Usuários
- Painéis e cards adaptados ao mesmo sistema de superfícies, radius e densidade da RC6.
- Nenhuma alteração de endpoint ou lógica funcional.

## Não alterado
- Workflow 10 v2.3 e contratos de API.
- `d1`, `7d`, `30d`.
- autenticação e autorização.
- regras de CAG/água/qualidade.
- login institucional aprovado.
- Node 22 / Nixpacks / TanStack Start.
- `allowedHosts: ["expocenternorte.2see.io"]`.
