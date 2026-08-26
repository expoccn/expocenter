# Validação — Expo Center Norte Frontend V2 RC2 / Workflows

## Escopo

Revisão do frontend RC1 contra os contratos dos workflows Expo V2 e ajustes para produção em `https://expocenternorte.2see.io/`.

## Resultado estrutural

- 93 arquivos `.ts`/`.tsx` + `vite.config.ts` analisados pelo parser TypeScript.
- 0 erros de sintaxe.
- 0 imports locais quebrados.
- `package.json` válido.
- 9 rotas funcionais Expo + root.
- 0 arquivos de rotas legadas Claro remanescentes.

## Contratos n8n

Foram confrontados 22 endpoints efetivamente utilizados pelo frontend com os webhooks presentes no pacote Expo n8n:

- 22/22 encontrados.
- 0 endpoints utilizados sem `OPTIONS` correspondente.
- IA usa `/expo-v2/ai-chat`, `/ai-history`, `/ai-clear`.
- PDFs CAG usam `/expo-v2/report-*-pdf`.
- demonstrativo usa `/expo-v2/water/demonstrative`.
- autenticação usa `/expo-v2/auth/*`.

Os aliases antigos `/expo-cag-ai-assistant` e `/cag/reports` não são usados pelo código RC2.

## Autenticação

Contratos de resposta foram ajustados aos workflows 14–21:

- `ME` não exige `expires_at` inexistente no workflow 15;
- troca de senha exige mínimo de 10 caracteres, igual ao workflow 17;
- reset de senha usa `user_id`, `username` e `temporary_password`, igual ao workflow 21;
- ausência de `last_login_at` no workflow 18 aparece como `N/D`, não como “Nunca”.

## IA

- `session_id` alinhado ao regex aceito pelos workflows 23–25: `[-_A-Za-z0-9]`, 8–120 caracteres.
- histórico carregado do workflow 24;
- limpeza usa workflow 25;
- pergunta limitada a 800 caracteres;
- evidências e limitações permanecem visíveis.

## Trends

- séries CAG separadas por Chiller Azul / Branco / Vermelho;
- linhas não atravessam de um equipamento para outro;
- `connectNulls=false` para preservar gaps;
- linha de capacidade só é exibida quando a API fornecer capacidade na série;
- perfil de água também não conecta artificialmente lacunas.

## Hidrômetros

A lista do demonstrativo foi comparada ao CSV real `Consumo - Hidrômetros_13_20260825_060020.csv`:

- 17 colunas de medidores no CSV;
- 17 opções no frontend;
- 0 ausentes;
- 0 extras.

Nos agrupamentos por pavimento, um tipo sem valor válido aparece como `N/D` em vez de `0`.

## Produção / preview

- `VITE_EXPO_PREVIEW_MODE=false` no `.env.example`.
- Preview só liga quando `VITE_EXPO_PREVIEW_MODE=true` for definido explicitamente.
- `VITE_EXPO_PPTX_ENABLED=false` por padrão enquanto workflows 39–41/serviço PPTX não estiverem ativos.

## Vite / domínio

`vite.config.ts` validado com:

```ts
server: {
  allowedHosts: ["expocenternorte.2see.io"],
},
preview: {
  allowedHosts: ["expocenternorte.2see.io"],
},
```

Correspondente ao domínio público:

```text
https://expocenternorte.2see.io/
```

## Referência histórica

A interface marca a referência como histórica quando `period.referenceDate` estiver mais de um dia atrás da data local. Essa correção é apenas visual e não altera indicadores retornados pelo workflow 10.

## Limitação da validação neste ambiente

Não há `node_modules` instalado no sandbox e o ambiente de geração não dispõe de acesso confiável ao registry npm. Portanto, não foi declarado um build completo local. A validação final de dependências e bundling deve ocorrer no EasyPanel durante:

```bash
npm install --no-audit --no-fund --legacy-peer-deps
npm run build
```

O pacote só deve ser promovido após esse build concluir sem erro.
