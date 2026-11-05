import { RANGOS } from 'src/domain/rangos'

export interface Beneficio {
  id: string
  nivel: string
  titulo: string
  detalle: string
  descuento: number
  productos: string[]
  reciclajes: number
}

function reciclajesDelRango(nombre: string): number {
  const rango = RANGOS.find((opcion) => opcion.name === nombre)
  if (!rango) throw new Error(`No existe el rango "${nombre}" para el beneficio`)
  return rango.min
}

export const BENEFICIOS: Beneficio[] = [
  {
    id: 'Brote',
    nivel: 'Brote',
    titulo: '25% de descuento',
    detalle: 'En un producto',
    descuento: 25,
    productos: ['Alfajor Jorgito'],
    reciclajes: reciclajesDelRango('Brote'),
  },
  {
    id: 'Planta',
    nivel: 'Planta',
    titulo: '50% de descuento',
    detalle: 'En un producto',
    descuento: 50,
    productos: ['Sándwich de jamon y queso'],
    reciclajes: reciclajesDelRango('Planta'),
  },
  {
    id: 'Arbol',
    nivel: 'Árbol',
    titulo: '50% de descuento en dos productos',
    detalle: '50% en cada uno',
    descuento: 50,
    productos: ['Coca Cola 600ml', 'Beldent'],
    reciclajes: reciclajesDelRango('Arbol'),
  },
  {
    id: 'Bosque',
    nivel: 'Bosque',
    titulo: 'Tres productos gratis',
    detalle: 'Sin costo',
    descuento: 100,
    productos: ['Cepita 1L', 'Pep 700g', 'Turrón'],
    reciclajes: reciclajesDelRango('Bosque'),
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
