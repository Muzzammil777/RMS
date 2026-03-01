// API Configuration - Using FastAPI backend
// Uses environment variable or defaults to production URL

export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api/admin';

// Legacy exports (kept for compatibility, not used with local backend)
export const projectId = 'localhost';
export const publicAnonKey = '';
