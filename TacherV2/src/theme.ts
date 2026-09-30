import type { ViewStyle } from 'react-native'

export const COLORES = {
  blanco: '#FFFFFF',

  verde50: '#f0fdf4',
  verde100: '#dcfce7',
  verde200: '#bbf7d0',
  verde300: '#86efac',
  verde600: '#16a34a',
  verde700: '#15803d',
  verde800: '#166534',

  gris200: '#e5e7eb',
  gris400: '#9ca3af',
  gris500: '#6b7280',
  gris600: '#4b5563',
  gris700: '#374151',
  gris800: '#1f2937',
  gris900: '#111827',

  rojo50: '#fef2f2',
  rojo300: '#fca5a5',
  rojo500: '#ef4444',
  rojo600: '#dc2626',

  amarillo400: '#facc15',

  // Atajos usados sobre todo en íconos
  verde: '#16a34a',
  gris: '#9ca3af',
} as const

/** Sombras reutilizables */
export const SOMBRAS: Record<'chica' | 'media' | 'grande', ViewStyle> = {
  chica: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  media: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  grande: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
}
