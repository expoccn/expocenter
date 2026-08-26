# RC4 — Login responsivo / viewport fix

Correção do login validado para evitar corte vertical em desktop.

## Alterações
- Desktop passa a respeitar a altura útil da viewport (`100svh`).
- Container principal não cresce além da viewport em `lg+`.
- Coluna esquerda e direita passam a usar altura integral do container, sem `min-height: 760px` forçado.
- Espaçamentos verticais do formulário foram compactados em telas desktop de altura normal; em `2xl` o layout recupera dimensões maiores.
- Logo CCN permanece no rodapé esquerdo e continua reutilizando `/ccn-logo-white.png`, o mesmo asset do sidebar.
- A coluna direita só cria scroll interno em alturas excepcionalmente pequenas, em vez de cortar o rodapé da página inteira.
- Mantido `vite.config.ts` com `expocenternorte.2see.io`.
- Reincorporado hardening de deploy: Node 22, `.nvmrc`, `nixpacks.toml` e script SSR `start`.
