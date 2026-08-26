# Validação RC6 — UI Refinement

## Código
- 96 arquivos TS/TSX analisados sintaticamente com TypeScript 5.8.3 (`createSourceFile`).
- 0 erros de parsing TypeScript/TSX.
- 186 imports locais verificados; 0 referências locais ausentes. O import Vite `styles.css?url` foi tratado como virtual/esperado.
- 4 arquivos JSON validados; 0 inválidos.
- `vite.config.ts` preservado com `allowedHosts: ["expocenternorte.2see.io"]` em server e preview.

## Marca
- `expo-center-norte-mark.png`: RGBA com fundo transparente, derivado mecanicamente da imagem enviada sem redesenho da marca.
- Favicon PNG/ICO e Apple Touch Icon gerados a partir da mesma marca.
- O antigo `/favicon.svg` não é mais referenciado pelo app.
- `ccn-logo-white.png` não foi substituído e continua sendo o mesmo asset usado no login/sidebar.

## Contraste
Contraste calculado para os pares estruturais de texto/superfície da RC6:

| Par | Contraste aproximado |
|---|---:|
| Light: foreground / card | 16.7:1 |
| Light: muted-foreground / card | 6.5:1 |
| Dark: foreground / card | 16.7:1 |
| Dark: muted-foreground / card | 7.5:1 |
| Light: primary / card | 5.1:1 |
| Dark: primary / card | 6.7:1 |

Os tooltips de gráfico usam `card`, `foreground` e `muted-foreground`, fazendo a troca automática de contraste entre tema claro e escuro.

## Tooltips / hover
- Todos os Recharts do dashboard usam `ExpoChartTooltip`.
- Não restaram usos diretos de `contentStyle=` nos gráficos do dashboard.
- Radix `TooltipContent` usa `bg-popover text-popover-foreground`.
- Dropdown, Popover, Select e HoverCard permanecem baseados nos mesmos tokens temáticos.
- Cursor/área de hover dos gráficos usa `--chart-cursor` / `--chart-hover` em ambos os temas.

## Identidade antiga
- 0 referências ao ícone `Snowflake` nos novos componentes `ExpoLogo` e `Sidebar`.
- O app referencia `/expo-favicon-32.png` e `/apple-touch-icon.png` no documento raiz.

## Limitação da validação local
O pacote não contém `node_modules`; portanto não foi executado `vite build` neste ambiente. O build do EasyPanel continua sendo a validação final de bundling e renderização real no navegador.
