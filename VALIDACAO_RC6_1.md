# Validação — RC6.1 Login Fullscreen

## Escopo

Correção exclusiva do `src/components/auth/AuthShell.tsx` e atualização de metadados/documentação.

## Critérios verificados

- sem `max-w-[1540px]` no AuthShell;
- sem padding externo responsivo no AuthShell;
- sem `rounded-[26px]` no container principal do AuthShell;
- sem shadow externa no container principal;
- desktop usa `lg:h-[100svh]`;
- desktop mantém `lg:overflow-hidden` no shell e `lg:overflow-y-auto` na coluna de formulário;
- mobile mantém `min-h-[100svh]`;
- layout interno, fotografia, CCN e conteúdo do formulário preservados.
