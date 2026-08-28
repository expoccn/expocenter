# RC6.3 — Evidências da IA

## Objetivo
Corrigir a apresentação das evidências do Copiloto Expo sem alterar os contratos dos workflows 23–25/27 nem a lógica de resposta da IA.

## Problema observado
O frontend exibia `evidence.value` com `JSON.stringify`, o que fazia objetos e séries longas aparecerem como payload técnico cru. Em respostas executivas, uma evidência diária de 31 dias podia ocupar grande parte da tela com JSON contínuo.

## Alterações
- Removida a renderização de JSON cru das evidências.
- Temperaturas são exibidas como Entrada / Saída com unidade.
- Resumos de água são exibidos como KPIs de consumo total, potável, reúso e participação do reúso.
- Resumos de chillers são exibidos por equipamento, com horas de operação e alarmes.
- Séries CAG + água alinhadas por dia mostram quatro dias inicialmente e permitem expandir os demais registros.
- Arrays genéricos passam a mostrar uma prévia organizada e detalhes expansíveis.
- Objetos genéricos são convertidos em campos nome/valor legíveis.
- Códigos internos de origem, como `raw_latest` e `water_period`, passam a ter rótulos amigáveis. O código original continua disponível no atributo `title` do rótulo para rastreabilidade.
- Evidências extensas ocupam a largura total do bloco; evidências curtas continuam em duas colunas quando houver espaço.
- O cabeçalho passa a usar “Dados que sustentam a resposta” com contagem de evidências.

## Preservado
- Fluxo otimista RC6.2: pergunta aparece imediatamente e o estado “Analisando dados” permanece até a resposta.
- `/ai-chat`, `/ai-history` e `/ai-clear`.
- `used_llm`, limitações, histórico por sessão e período selecionado.
- Conteúdo completo recebido do backend; a alteração é somente de apresentação.
