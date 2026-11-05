import { Box, Recycle, Trash2 } from 'lucide-react-native'
import { COLORES } from 'src/theme'

function normalizar(texto?: string | null) {
  if (!texto) return ''
  return texto
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export function obtenerIconoCategoria(categoria?: string | null, residuo?: string | null) {
  const cat = normalizar(categoria)
  const res = normalizar(residuo)

  const esBotella = ['botella', 'botellas', 'botella_plastico', 'pet', 'plastico_botella'].some(
    (clave) => cat === clave || cat.includes(clave) || res.includes(clave),
  )
  if (esBotella) {
    return { Icono: Trash2, color: COLORES.principal }
  }

  const esLata = ['lata', 'latas', 'aluminio', 'aluminio_lata', 'lata_aluminio'].some(
    (clave) => cat === clave || cat.includes(clave) || res.includes(clave),
  )
  if (esLata) {
    return { Icono: Trash2, color: COLORES.principalOscuro }
  }

  const esCarton = ['carton', 'carton_corrugado', 'papel_carton', 'caja', 'cajas'].some(
    (clave) => cat === clave || cat.includes(clave) || res.includes(clave),
  )
  if (esCarton) {
    return { Icono: Box, color: COLORES.oscuro }
  }

  return { Icono: Recycle, color: COLORES.textoSuave }
}
