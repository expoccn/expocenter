# Expo Center Norte Frontend V2 — RC6.2 AI Feedback

## Objetivo

Ajustar a experiência do chat da IA sem alterar os contratos dos workflows Expo V2.

## Problema corrigido

Na RC6.1, ao enviar uma pergunta, o frontend aguardava o retorno do `/ai-chat` e depois aguardava uma nova leitura de `/ai-history` antes de inserir a pergunta no chat. Durante esse intervalo, apenas o botão mostrava um spinner, criando a impressão de travamento.

## Novo fluxo

1. O usuário envia a pergunta.
2. A pergunta é inserida imediatamente no chat.
3. O campo de texto é limpo imediatamente.
4. O Copiloto Expo exibe um balão de estado com spinner e `Analisando dados`.
5. O frontend consulta o mesmo endpoint `/ai-chat`, sem alteração de payload ou contrato.
6. Quando a resposta chega, o estado de análise é substituído pela resposta, evidências, limitações e indicador determinístico/LLM.
7. Se houver falha, a pergunta permanece visível e recebe um retorno de erro no próprio fluxo da conversa.

## Melhorias complementares

- rolagem automática suave para a mensagem mais recente;
- `aria-live` no estado de análise;
- sugestões rápidas ficam visualmente desabilitadas durante uma consulta;
- botão muda de `Enviar` para `Analisando...` enquanto a chamada está em andamento;
- não há segunda espera obrigatória de `/ai-history` após a resposta do `/ai-chat`;
- histórico continua sendo carregado do workflow 24 ao entrar na tela e limpo pelo workflow 25.

## Contratos preservados

- `/dashboard?period=d1|7d|30d`
- `/health`
- `/auth/*`
- `/ai-chat`
- `/ai-history`
- `/ai-clear`
- `/water/demonstrative`
- `/report-daily-pdf`
- `/report-weekly-pdf`
- `/report-monthly-pdf`
- `/reports/water/monthly/pdf`
- `/reports/.../pptx`

Nenhum cálculo operacional foi movido para o frontend.
