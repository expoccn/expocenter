export const EXPO_PREVIEW_MODE = import.meta.env['VITE_EXPO_PREVIEW_MODE'] === 'true';
export const EXPO_PPTX_ENABLED = import.meta.env['VITE_EXPO_PPTX_ENABLED'] === 'true';

export const EXPO_API_BASE_URL = (
  import.meta.env['VITE_EXPO_API_BASE_URL'] ||
  import.meta.env['VITE_DATA_API_BASE_URL'] ||
  'https://ancar-n8n.gpfgqx.easypanel.host/webhook/expo-v2'
).replace(/\/$/, '');
