# RC5 — Visual Analytics

## Objetivo
Aumentar a densidade analítica do frontend sem deslocar regras de negócio para o React. As novas visualizações consomem séries e consolidados publicados pelo Workflow 10 v2.3, que por sua vez expõe dados já calculados pelo Operational CAG e pela consolidação de água.

## Visão Geral
- Horas de operação / parada / alarme por chiller.
- Potável × reúso.
- Consumo por pavilhão.
- Capacidade média Total / Circuito A / Circuito B.
- Tendência de água gelada e pontos de atenção preservados.

## CAG
- Overview com operação e capacidade comparativa.
- Chillers: seletor Azul/Branco/Vermelho e gráficos de água gelada, capacidade e pressões.
- Bombas: pressão real × setpoint, bypass e timeline ON/OFF das BAGs.
- Tendências: seletor de contexto (Água gelada, Capacidade, Pressões, Bombas) e grupo.
- Cards enriquecidos com horas, partidas e dados de óleo/circuitos quando disponíveis.

## Hidrômetros
- Perfil temporal de consumo.
- Potável × reúso.
- Ranking por pavilhão.
- Comparativo por janela horária.
- Top 10 hidrômetros por consumo.
- Agrupamento por pavilhão passou a vir do contrato da API.

## Qualidade
- Cobertura por fonte.
- Composição dos status.
- Disponibilidade diária das 6 fontes CAG.
- Cards detalhados preservados.

## Governança
- Ausência continua N/D; não vira zero.
- Gaps de séries usam connectNulls=false.
- Nenhuma faixa de pressão, bypass, Delta T ou capacidade foi adicionada como diagnóstico automático.
- O gráfico de disponibilidade diária mede presença das seis fontes CAG por data e não é apresentado como cobertura amostral.
