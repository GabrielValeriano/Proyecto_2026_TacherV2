import type { ViewStyle } from 'react-native'

interface Paleta {
  oscuro: string // encabezado, tarjeta de puntos, textos fuertes
  principal: string // botones y acciones
  principalOscuro: string // texto verde sobre fondos claros
  suave: string // chips, íconos y fondos suaves
  acento: string // el único color de realce (barra de progreso, "V2", moneda)
  fondo: string // fondo de las pantallas
  texto: string
  textoSuave: string
  linea: string // bordes de tarjetas
  borde: string // bordes de campos de texto
  sobreOscuro: string // textos claros sobre el color oscuro
}

/** Paletas disponibles. Para cambiar el look de TODA la app, cambiá PALETA_ACTIVA. */
const PALETAS: Record<'suave' | 'equilibrada' | 'vibrante' | 'sol', Paleta> = {
  suave: {
    oscuro: '#234B3B',
    principal: '#35805F',
    principalOscuro: '#2B6A50',
    suave: '#E3EFE8',
    acento: '#CADB8E',
    fondo: '#F6F9F6',
    texto: '#1D2B24',
    textoSuave: '#5C6B63',
    linea: '#D7E4DC',
    borde: '#C9DDD0',
    sobreOscuro: '#A9CDBB',
  },
  equilibrada: {
    oscuro: '#184A39',
    principal: '#268257',
    principalOscuro: '#1D6A47',
    suave: '#DDF0E5',
    acento: '#C9DF5C',
    fondo: '#F4F9F5',
    texto: '#14281F',
    textoSuave: '#55675D',
    linea: '#CFE2D5',
    borde: '#C3DCCB',
    sobreOscuro: '#A8D3BC',
  },
  vibrante: {
    oscuro: '#0E3B2B',
    principal: '#1B8F5A',
    principalOscuro: '#14744A',
    suave: '#D8F3E4',
    acento: '#B7E34B',
    fondo: '#F5FAF6',
    texto: '#12261D',
    textoSuave: '#5B6B63',
    linea: '#D5E5DA',
    borde: '#BDE3CE',
    sobreOscuro: '#9FD9B8',
  },
  sol: {
    oscuro: '#184A39',
    principal: '#268257',
    principalOscuro: '#1D6A47',
    suave: '#DDF0E5',
    acento: '#B7E34B',
    fondo: '#F8FAF4',
    texto: '#14281F',
    textoSuave: '#55675D',
    linea: '#D6E4D6',
    borde: '#C3DCCB',
    sobreOscuro: '#A8D3BC',
  },
}

const PALETA_ACTIVA: keyof typeof PALETAS = 'sol'
const p = PALETAS[PALETA_ACTIVA]

export const COLORES = {
  blanco: '#FFFFFF',

  // --- Paleta (usá estos nombres en el código nuevo)
  oscuro: p.oscuro,
  principal: p.principal,
  suave: p.suave,
  acento: p.acento,
  fondo: p.fondo,
  texto: p.texto,
  textoSuave: p.textoSuave,
  linea: p.linea,
  sobreOscuro: p.sobreOscuro,

  // --- Nombres anteriores: se mantienen para no tocar todas las pantallas,
  //     pero ahora apuntan a la paleta activa
  verde50: p.fondo,
  verde100: p.suave,
  verde200: p.borde,
  verde300: p.sobreOscuro,
  verde600: p.principal,
  verde700: p.principalOscuro,
  verde800: p.oscuro,
  amarillo400: p.acento,
  verde: p.principal,

  // --- Grises con un toque de verde
  gris200: '#DCE6E0',
  gris400: '#9AAAA1',
  gris500: p.textoSuave,
  gris600: '#47594F',
  gris700: '#33463C',
  gris800: '#22362C',
  gris900: p.texto,
  gris: '#9AAAA1',

  // --- Solo para errores y acciones peligrosas
  rojo50: '#fef2f2',
  rojo300: '#fca5a5',
  rojo500: '#ef4444',
  rojo600: '#dc2626',
}

/** Sombras reutilizables. Se usan con spread: { ...SOMBRAS.chica } */
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
