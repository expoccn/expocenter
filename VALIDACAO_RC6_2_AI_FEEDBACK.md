# Validação — Expo Center Norte Frontend V2 RC6.2 / AI Feedback

## Escopo

Revisão do frontend enviado contra a arquitetura Expo V2 atual e correção do feedback visual do chat da IA.

## Resultado estrutural

- 95 arquivos `.ts`/`.tsx` + `vite.config.ts` analisados pelo parser TypeScript.
- 0 erros de sintaxe encontrados.
- 9 rotas funcionais + root preservados.
- 39 verificações direcionadas de estrutura/contrato: 39 PASS.
- Nenhuma referência de produção aos aliases antigos `/expo-cag-ai-assistant`, `/cag/reports`, `agua-ai/demonstrativo` ou `Redis-cache-ancar`.

## Contratos Expo V2 preservados

O código continua usando:

- Dashboard: `/dashboard?period=d1|7d|30d`
- Health: `/health`
- Auth: `/auth/login`, `/auth/me`, `/auth/logout`, `/auth/change-password`, `/auth/admin-*`
- IA: `/ai-chat`, `/ai-history`, `/ai-clear`
- Demonstrativo workflow 32: `/water/demonstrative`
- PDFs CAG: `/report-daily-pdf`, `/report-weekly-pdf`, `/report-monthly-pdf`
- Relatório mensal de água: `/reports/water/monthly/pdf`
- PPTX: `/reports/.../pptx`, condicionado a `VITE_EXPO_PPTX_ENABLED=true`

O frontend continua sem recalcular KPIs operacionais.

## Hidrômetros

- 17 opções do demonstrativo preservadas.
- 17 IDs únicos.
- `N/D` permanece usado quando a API não fornece valor válido.
- O demonstrativo continua enviando `local_id`, datas, horários, `tipo_relatorio` e `tarifa_m3` ao workflow 32.

## Correção do chat da IA

### Antes

1. usuário clicava em Enviar;
2. apenas o botão entrava em `busy`;
3. frontend aguardava `/ai-chat`;
4. frontend ainda aguardava `/ai-history`;
5. pergunta e resposta apareciam praticamente juntas.

Isso dava a impressão de travamento.

### Agora

1. a pergunta aparece imediatamente no chat;
2. o campo é limpo imediatamente;
3. surge o balão do `Copiloto Expo` com spinner e badge `Analisando dados`;
4. o texto informa que as evidências do período estão sendo consultadas;
5. o frontend chama o mesmo `/ai-chat` e aguarda normalmente;
6. quando a resposta chega, o estado temporário é substituído pela resposta, evidências, limitações e selo determinístico/LLM;
7. a conversa rola automaticamente até a mensagem mais recente;
8. em caso de erro, a pergunta não desaparece: ela permanece no fluxo com um retorno de falha;
9. o histórico continua sendo carregado pelo workflow 24 ao abrir a tela;
10. a limpeza continua usando o workflow 25.

## Validação específica da UX da IA

PASS:

- `setPending(...)` ocorre antes de `await askExpoAi(...)`;
- existe spinner `LoaderCircle` dentro do balão da conversa;
- existe badge `Analisando dados`;
- campo é limpo antes da chamada HTTP;
- remoção da espera obrigatória de `refreshHistory()` após `/ai-chat`;
- auto-scroll via `scrollIntoView`;
- limite de 800 caracteres preservado;
- evidências e limitações preservadas;
- erro de API não remove a pergunta enviada.

## Ambiente / deploy

- `VITE_EXPO_PREVIEW_MODE=false` permanece como padrão.
- `VITE_EXPO_PPTX_ENABLED=false` permanece como padrão.
- `expocenternorte.2see.io` permanece permitido em `server` e `preview` no Vite.

## Ponto de negócio a confirmar

O formulário de demonstrativo ainda inicia a tarifa em `31.84 R$/m³`. O campo é editável e o valor é enviado ao workflow 32, mas esse default é uma regra de negócio embutida no frontend. Não foi alterado nesta RC6.2 porque a revisão não possui uma tarifa oficial atual que justifique substituir o valor.

Recomendação: quando houver uma fonte oficial/parametrização de tarifa, remover o default fixo do frontend ou carregá-lo de configuração central.

## Limitação desta validação

O `npm install` não concluiu no sandbox dentro do tempo disponível e não deixou `node_modules`. Portanto, não foi possível declarar um `vite build` completo local.

A promoção em produção deve continuar exigindo no EasyPanel:

```bash
npm install --no-audit --no-fund --legacy-peer-deps
npm run build
```

Somente promover após o build finalizar sem erro.
