# RC3 — Login validado

- Aplica o conceito visual de login aprovado para Expo Center Norte.
- Mantém o fluxo de autenticação real existente.
- Usa `/ccn-logo-white.png` no login, exatamente o mesmo asset usado no sidebar.
- Adiciona fachada aprovada como fundo institucional da área esquerda.
- Adiciona identificação visual Expo Center Norte no painel de acesso.
- `Lembrar-me` passa a persistir o token em `localStorage`; sessão normal permanece em `sessionStorage`.
- `Esqueci minha senha` orienta o usuário a solicitar reset ao administrador, sem inventar endpoint inexistente.
- Mantém `vite.config.ts` com `allowedHosts: ["expocenternorte.2see.io"]`.
