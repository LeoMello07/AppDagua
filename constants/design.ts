/**
 * Design tokens do AppDagua — extraídos do Design System "Hydro-Social Fluidity" (Stitch).
 * Fonte única de verdade para cores, espaçamentos e raios do app.
 */

export const Palette = {
  // Cores da marca (Stitch)
  primary: '#007AFF',
  primaryDark: '#0059C9',
  secondary: '#E0F2F7',
  tertiary: '#2DD4BF',
  neutral: '#0F172A',

  // Derivadas para UI
  textPrimary: '#0F172A',
  textMuted: '#64748B',
  background: '#F8FAFC',
  card: '#FFFFFF',
  border: '#E2E8F0',
  tabInactive: '#94A3B8',

  // Água (preenchimento do medidor)
  waterFill: '#8EC5E8',
  waterDeep: '#4F9FD4',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
} as const;
