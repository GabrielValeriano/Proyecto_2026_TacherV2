import { NIVELES } from 'src/domain/niveles'

export interface Beneficio {
  id: string
  nivel: string
  titulo: string
  detalle: string
  descuento: number
  productos: string[]
  reciclajes: number
}

function reciclajesDelNivel(nombre: string): number {
  const nivel = NIVELES.find((opcion) => opcion.name === nombre)
  if (!nivel) throw new Error(`No existe el nivel "${nombre}" para el beneficio`)
  return nivel.min
}

export const BENEFICIOS: Beneficio[] = [
  {
    id: 'Brote',
    nivel: 'Brote',
    titulo: '25% de descuento',
    detalle: 'En un producto',
    descuento: 25,
    productos: ['Alfajor Jorgito'],
    reciclajes: reciclajesDelNivel('Brote'),
  },
  {
    id: 'Planta',
    nivel: 'Planta',
    titulo: '50% de descuento',
    detalle: 'En un producto',
    descuento: 50,
    productos: ['Sándwich de jamon y queso'],
    reciclajes: reciclajesDelNivel('Planta'),
  },
  {
    id: 'Arbol',
    nivel: 'Árbol',
    titulo: '50% de descuento en dos productos',
    detalle: '50% en cada uno',
    descuento: 50,
    productos: ['Coca Cola 600ml', 'Beldent'],
    reciclajes: reciclajesDelNivel('Arbol'),
  },
  {
    id: 'Bosque',
    nivel: 'Bosque',
    titulo: 'Tres productos gratis',
    detalle: 'Sin costo',
    descuento: 100,
    productos: ['Cepita 1L', 'Pep 700g', 'Turrón'],
    reciclajes: reciclajesDelNivel('Bosque'),
  },
]

export function estaDesbloqueado(beneficio: Beneficio, reciclajes = 0): boolean {
  return Math.max(0, Number(reciclajes) || 0) >= beneficio.reciclajes
}

export function getBeneficioInicial(reciclajes = 0): Beneficio {
  return [...BENEFICIOS].reverse().find((beneficio) => estaDesbloqueado(beneficio, reciclajes)) ?? BENEFICIOS[0]
}

export function getTextoOferta(beneficio: Beneficio): string {
  return beneficio.descuento === 100 ? 'Gratis' : `${beneficio.descuento}% OFF`
}
