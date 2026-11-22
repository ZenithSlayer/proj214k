import '@/global.css';

export const Colors = {
  light: {
    text: '#0f172a',
    background: '#f8fafc',
    backgroundElement: '#ffffff',
    backgroundSelected: '#e2e8f0',
    textSecondary: '#64748b',
    surface: '#ffffff',
    surfaceAlt: '#f1f5f9',
    border: '#cbd5e1',
    header: '#ffffff',
    drawer: '#ffffff',
    drawerActive: '#e2e8f0',
    primary: '#2563eb',
    accent: '#2563eb',
  },
  dark: {
    text: '#f8fafc',
    background: '#0f1729',
    backgroundElement: '#1e293b',
    backgroundSelected: '#334155',
    textSecondary: '#94a3b8',
    surface: '#1e293b',
    surfaceAlt: '#0f172a',
    border: '#475569',
    header: '#1e293b',
    drawer: '#0f172a',
    drawerActive: '#334155',
    primary: '#ef4444',
    accent: '#ef4444',
  },
} as const;
