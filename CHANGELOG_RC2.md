# RC2 — alinhamento com workflows Expo V2

- produção real por padrão (`VITE_EXPO_PREVIEW_MODE=false`);
- `vite.config.ts` liberado para `expocenternorte.2see.io`;
- API consolidada em `/webhook/expo-v2`;
- IA migrada para workflows 23/24/25 (chat, histórico, clear);
- autenticação alinhada aos contratos 14–21, inclusive senha mínima de 10 caracteres e reset administrativo;
- PDFs CAG apontados ao workflow 38;
- PPTX protegido por `VITE_EXPO_PPTX_ENABLED=false` até ativação de 39–41/serviço externo;
- Trends CAG separados por chiller e gaps preservados;
- aviso de referência histórica;
- 17 hidrômetros do CSV atual incluídos no demonstrativo;
- agrupamentos de água preservam `N/D` quando não existe valor válido;
- rotas e tipos legados não utilizados removidos.
