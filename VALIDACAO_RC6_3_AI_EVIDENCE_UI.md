# Validação RC6.3 — Evidências da IA

## Escopo
Correção visual da apresentação de evidências em `src/routes/analises-ia.tsx`.

## Verificações executadas
- PASS — `JSON.stringify(evidence.value)` removido da renderização.
- PASS — renderer semântico genérico para evidências.
- PASS — renderer específico de temperaturas Entrada/Saída.
- PASS — renderer específico do resumo hídrico.
- PASS — renderer específico do resumo de chillers.
- PASS — séries diárias CAG + água passam a ser resumidas e expansíveis.
- PASS — rótulos amigáveis para fontes internas como `raw_latest` e `water_period`.
- PASS — fluxo RC6.2 “Analisando dados” preservado.
- PASS — `/ai-chat` preservado.
- PASS — `/ai-history` preservado.
- PASS — `/ai-clear` preservado.
- PASS — imports locais da rota modificada encontrados.
- PASS — sintaxe TypeScript/JSX validada com `tsc --noCheck`.

## Comportamento esperado nos casos enviados
### Temperatura dos chillers
Em vez de:
`{"entrada":7.21,"saida":8.26,"unidade":"°C","metrica":"ultimo_ponto"} · raw_latest`

a interface exibe dois campos: **Entrada 7,21 °C** e **Saída 8,26 °C**, com a origem **Leitura mais recente**.

### Resumo de água
Em vez do objeto JSON, são exibidos KPIs de **Consumo total**, **Água potável**, **Água de reúso** e **Participação do reúso**.

### CAG + água alinhados por dia
Em vez de uma série JSON longa de 31 objetos, a interface mostra os quatro primeiros dias de forma tabular/legível e um controle **Ver mais N dias** para expandir os demais.

## Observação de build
A alteração foi validada estaticamente e por parser TypeScript. O pacote desta sessão não possui `node_modules`; por isso não foi marcado como build Vite completo. Fazer Rebuild/Redeploy no EasyPanel antes da promoção definitiva.
