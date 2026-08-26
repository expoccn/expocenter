# Expo Center Norte Frontend V2 RC2 — EasyPanel

## Domínio

```text
https://expocenternorte.2see.io/
```

O `vite.config.ts` já contém `allowedHosts: ["expocenternorte.2see.io"]` para `server` e `preview`.

## Variáveis recomendadas

```env
VITE_EXPO_PREVIEW_MODE=false
VITE_EXPO_PPTX_ENABLED=false
VITE_EXPO_API_BASE_URL=https://ancar-n8n.gpfgqx.easypanel.host/webhook/expo-v2
VITE_DATA_API_BASE_URL=https://ancar-n8n.gpfgqx.easypanel.host/webhook/expo-v2
```

Mantenha `VITE_EXPO_PPTX_ENABLED=false` até o `expo-pptx-service` e os workflows 39–41 estarem operacionais.

## Build e deploy

1. Substitua o código do serviço pelo conteúdo deste pacote.
2. Root/Build Path: `.`.
3. Faça **Build/Rebuild**.
4. Confirme que `npm install` e `npm run build` terminam sem erro.
5. Faça **Deploy**.
6. Exponha a porta interna `3000`.
7. Abra `https://expocenternorte.2see.io/`.

O Dockerfile executa:

```bash
npm install --no-audit --no-fund --legacy-peer-deps
npm run build
```

Depois inicia:

```bash
node .output/server/index.mjs
```

## Smoke test após deploy

1. Login.
2. Visão Geral em D1, 7d e 30d.
3. CAG → Tendências: trocar Azul/Branco/Vermelho e confirmar que não há linhas conectando chillers diferentes.
4. Confirmar badge de referência histórica quando os dados estiverem defasados.
5. Hidrômetros: confirmar `N/D` para fontes sem dado/com falha, nunca `0` artificial.
6. Qualidade dos Dados.
7. IA: pergunta, histórico e limpeza.
8. PDF CAG via workflow 38, quando os relatórios já estiverem publicados.
9. PowerPoint deve permanecer desabilitado enquanto `VITE_EXPO_PPTX_ENABLED=false`.

## Observação de build local

A validação desta entrega verificou sintaxe, imports locais, contratos de endpoints e estrutura de rotas. O build completo com dependências externas deve ser confirmado pelo próprio EasyPanel.
