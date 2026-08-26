# Deploy RC5

## Dependência de backend
Recomendado importar/ativar primeiro o Workflow 10 v2.3 Visual Analytics. O RC5 possui fallback visual para ausência do bloco `analytics`, mas os novos gráficos só recebem dados completos com o v2.3.

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

O projeto preserva `.nvmrc=22`, `engines.node=22.x`, `nixpacks.toml` e TanStack Start SSR.

## Host Vite
`allowedHosts: ["expocenternorte.2see.io"]` preservado para server e preview.

## Smoke test
1. Login.
2. D-1 / 7d / 30d.
3. Home: gráficos Operação, Potável × Reúso, Consumo por pavilhão e Capacidade.
4. CAG > Chillers: trocar Azul/Branco/Vermelho.
5. CAG > Bombas: pressão, bypass e BAGs.
6. CAG > Tendências: trocar contexto e grupo.
7. Hidrômetros: pavilhão, janelas e top medidores.
8. Qualidade: cobertura, status e disponibilidade diária CAG.
