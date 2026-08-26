# Validação — Login RC4 responsivo

- Login desktop limitado à altura útil da viewport.
- Removido `min-height: 760px` das colunas desktop.
- CCN permanece usando o mesmo `/ccn-logo-white.png` do sidebar.
- `vite.config.ts`: `expocenternorte.2see.io` preservado.
- Node 22 / Nixpacks SSR incorporados no pacote.
- Arquivos alterados (`AuthShell.tsx`, `login.tsx`, `vite.config.ts`) passaram por transpile sintático com TypeScript 5.8.3: 0 erros de sintaxe.
- Build completo de dependências não executado neste ambiente; validação final de bundling permanece no EasyPanel.
