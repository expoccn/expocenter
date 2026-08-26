# Expo Center Norte — Frontend V2 RC2 / Workflows Expo V2

Frontend de produção para o Expo Center Norte, alinhado à nova arquitetura n8n/Redis Expo V2.

## Rotas ativas

- `/` — Visão Geral
- `/cag` — Chillers, Bombas & Hidráulica e Tendências
- `/hidrometros` — Gestão hídrica e qualidade dos hidrômetros
- `/qualidade-dados` — Cobertura e disponibilidade das fontes
- `/relatorios` — PDFs CAG, relatório mensal de água e demonstrativo Cliente/Técnico
- `/analises-ia` — IA governada, histórico e limpeza da sessão
- `/usuarios` — Administração de usuários
- `/login`
- `/alterar-senha`

Rotas remanescentes do frontend Claro foram removidas desta entrega.

## Produção real por padrão

O frontend não entra mais em preview automaticamente.

```env
VITE_EXPO_PREVIEW_MODE=false
VITE_EXPO_PPTX_ENABLED=false
VITE_EXPO_API_BASE_URL=https://ancar-n8n.gpfgqx.easypanel.host/webhook/expo-v2
VITE_DATA_API_BASE_URL=https://ancar-n8n.gpfgqx.easypanel.host/webhook/expo-v2
```

Use `VITE_EXPO_PREVIEW_MODE=true` somente para homologação visual sem backend real.

`VITE_EXPO_PPTX_ENABLED=false` deve permanecer enquanto o `expo-pptx-service` e os workflows 39–41 não estiverem ativos. Depois da implantação do serviço, altere para `true` e faça rebuild.

## Domínio EasyPanel / Vite

O domínio público é:

```text
https://expocenternorte.2see.io/
```

No `vite.config.ts`, o Vite recebe somente o hostname, conforme sua API:

```ts
server: {
  allowedHosts: ["expocenternorte.2see.io"],
},
preview: {
  allowedHosts: ["expocenternorte.2see.io"],
},
```

## Contratos utilizados pelo frontend

| Área | Método | Endpoint Expo V2 | Workflow |
|---|---|---|---:|
| Dashboard | GET | `/dashboard?period=d1\|7d\|30d` | 10 |
| Health | GET | `/health` | 12 |
| Login | POST | `/auth/login` | 14 |
| Sessão | GET | `/auth/me` | 15 |
| Logout | POST | `/auth/logout` | 16 |
| Senha | POST | `/auth/change-password` | 17 |
| Usuários | GET/POST | `/auth/admin-*` | 18–21 |
| IA | POST | `/ai-chat` | 23 |
| Histórico IA | GET | `/ai-history` | 24 |
| Limpar IA | POST | `/ai-clear` | 25 |
| Demonstrativo água | POST | `/water/demonstrative` | 32 |
| PDF CAG | GET | `/report-daily-pdf`, `/report-weekly-pdf`, `/report-monthly-pdf` | 38 |
| PDF água mensal | GET | `/reports/water/monthly/pdf` | 38 |
| PPTX | GET | `/reports/.../pptx` | 39–41 |

O frontend não usa mais o alias antigo `/expo-cag-ai-assistant` nem prefere `/cag/reports` para os PDFs.

## Tendências

A resposta do workflow 10 envia as séries de Água Gelada em um array com prefixos Azul/Branco/Vermelho. A RC2 separa essas séries no gráfico para não conectar o último ponto de um chiller ao primeiro ponto de outro.

- seletor Azul / Branco / Vermelho;
- gaps permanecem gaps (`connectNulls=false`);
- ausência não vira zero;
- capacidade só aparece no gráfico quando a API realmente fornecer valores de capacidade na série.

## Referência histórica

O workflow 10 atualmente marca `dataFreshness` como `CURRENT`. A RC2 faz uma normalização exclusivamente de apresentação: se `period.referenceDate` estiver mais de um dia atrás da data local, exibe o badge **Dados históricos**. Nenhum KPI é recalculado nessa etapa.

## Hidrômetros

A lista de locais do demonstrativo foi alinhada às 17 colunas do CSV WebCTRL usado pelo workflow 29. Quando um medidor/tipo não possui consumo válido, os agrupamentos da interface mostram `N/D` em vez de `0`.

## Relatórios

Os botões PDF baixam a última versão publicada pelo workflow 38. A geração agendada/operacional continua nos workflows de relatório; o navegador não recalcula o relatório.

Os botões PowerPoint ficam desabilitados por padrão até o serviço PPTX estar implantado.

## Deploy EasyPanel

O `Dockerfile` está na raiz:

```bash
npm install --no-audit --no-fund --legacy-peer-deps
npm run build
node .output/server/index.mjs
```

Porta interna: `3000`.

Variáveis `VITE_*` são incorporadas durante o build. Qualquer mudança exige **Rebuild + Redeploy**.

## Governança preservada na interface

- ausência de amostra não é zero;
- falha de comunicação é separada de leitura zero;
- gaps não são conectados artificialmente nos Trends;
- ΔT baixo isoladamente não é classificado como falha;
- IA apresenta evidências e limitações e não deve inventar causa raiz;
- alarmes Carrier exigem validação do mapeamento BMS;
- fluxo de água não é inferido por pressão/bypass.
