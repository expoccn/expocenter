# Deploy RC6

A RC6 é uma atualização visual sobre a RC5. Não exige mudança adicional de workflow além do Workflow 10 v2.3 já utilizado pela RC5.

## EasyPanel
Manter:

```env
VITE_EXPO_PREVIEW_MODE=false
VITE_EXPO_PPTX_ENABLED=false
VITE_EXPO_API_BASE_URL=https://ancar-n8n.gpfgqx.easypanel.host/webhook/expo-v2
VITE_DATA_API_BASE_URL=https://ancar-n8n.gpfgqx.easypanel.host/webhook/expo-v2
NIXPACKS_NODE_VERSION=22
NIXPACKS_SPA_CADDY=false
NIXPACKS_START_CMD=node .output/server/index.mjs
```

## Smoke test visual
1. Abrir tema claro e tema escuro.
2. Confirmar nova marca Expo na sidebar.
3. Confirmar favicon Expo na aba do navegador (pode exigir hard refresh devido ao cache do browser).
4. Visão Geral: passar o mouse por todos os gráficos e validar tooltip legível nos dois temas.
5. CAG > Chillers: Azul/Branco/Vermelho e tooltips de Água, Capacidade e Pressões.
6. CAG > Bombas: pressão, bypass e BAGs.
7. CAG > Tendências: quatro contextos e três grupos.
8. Hidrômetros: perfil, donut, pavilhões, janelas e ranking.
9. Qualidade: cobertura, donut e disponibilidade.
10. Conferir tabelas, selects, dropdowns e botões nos dois temas.

## Cache do favicon
Browsers mantêm favicon em cache agressivamente. Se a aba continuar exibindo o ícone antigo após deploy, usar hard refresh/aba anônima; o HTML da RC6 aponta para `/expo-favicon-32.png` e também existe `favicon.ico` atualizado.
