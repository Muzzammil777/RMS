// API Configuration - Using FastAPI backend
// In dev mode, use relative path so Vite proxy handles it (avoids browser HTTPS auto-upgrade)
// In production, use VITE_API_URL env variable
export const API_BASE_URL = import.meta.env.PROD
  ? (import.meta.env.VITE_API_URL || '') + '/api/admin'
  : '/api/admin';

// Legacy exports (kept for compatibility, not used with local backend)
export const projectId = 'localhost';
export const publicAnonKey = '';
