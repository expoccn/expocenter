# RC6.1 — Login Fullscreen

Correção pontual da camada de autenticação sobre a RC6.

## Alteração

O `AuthShell` deixou de ser renderizado como um card centralizado dentro da viewport e passou a ocupar toda a área disponível do navegador.

Removidos do shell externo:

- padding responsivo externo (`sm:p-3`, `lg:p-4`, `xl:p-5`);
- largura máxima global (`max-w-[1540px]`);
- bordas arredondadas do container inteiro;
- sombra do container inteiro;
- alturas calculadas `100svh - 24/32/40px`.

Novo comportamento:

- largura: 100% da viewport;
- altura no desktop: 100svh;
- coluna institucional e formulário ocupam a tela inteira;
- em desktop baixo, somente a coluna do formulário pode rolar verticalmente;
- em mobile, a coluna institucional continua oculta e o formulário mantém `min-height: 100svh`.

## Não alterado

- telas internas da RC6;
- identidade visual RC6;
- login/auth API;
- sessão e "Lembrar-me";
- logo Expo e favicon;
- logo CCN;
- workflow 10 / contratos de dados;
- configuração Node 22 / Nixpacks / EasyPanel.
