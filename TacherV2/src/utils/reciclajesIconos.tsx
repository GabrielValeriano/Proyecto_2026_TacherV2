import type { ComponentType } from 'react'
import { Package, Recycle } from 'lucide-react-native'
import { IconoBotella } from 'src/components/IconoBotella'
import { IconoLata } from 'src/components/IconoLata'
import { materialDelResiduo, type Material } from 'src/domain/materiales'
import { COLORES } from 'src/theme'

type IconoMaterial = ComponentType<{ size?: number; color?: string; strokeWidth?: number }>

export interface EstiloMaterial {
  Icono: IconoMaterial
  /** Color del ícono. */
  color: string
  /** Fondo del círculo que lo contiene. */
  fondo: string
  /** Nombre para mostrar ("Botella", "Lata", "Cartón"), o null si no se reconoce. */
  etiqueta: string | null
}

const ESTILOS: Record<Material, EstiloMaterial> = {
  botella: { Icono: IconoBotella, color: COLORES.principalOscuro, fondo: COLORES.suave, etiqueta: 'Botella' },
  lata: { Icono: IconoLata, color: COLORES.oscuro, fondo: 'rgba(183,227,75,0.32)', etiqueta: 'Lata' },
  carton: { Icono: Package, color: COLORES.avisoOscuro, fondo: COLORES.aviso50, etiqueta: 'Cartón' },
}

const GENERICO: EstiloMaterial = {
  Icono: Recycle,
  color: COLORES.principal,
  fondo: COLORES.fondo,
  etiqueta: null,
}

/** Ícono, colores y nombre del material para mostrar un reciclaje. */
export function obtenerIconoCategoria(categoria?: string | null, residuo?: string | null): EstiloMaterial {
  const material = materialDelResiduo(categoria, residuo)
  return material ? ESTILOS[material] : GENERICO
}
