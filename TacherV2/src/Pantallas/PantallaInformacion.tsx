import React from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import {
  CalendarDays,
  Cpu,
  GraduationCap,
  HeartHandshake,
  Leaf,
  Lightbulb,
  Server,
  Smartphone,
  Target,
  type LucideIcon,
} from 'lucide-react-native'
import { ScreenHeader } from 'src/components/ScreenHeader'
import { MarcaTacherV2, TacherV2Logo } from 'src/components/TacherV2Logo'
import { useApp } from 'src/context/AppContext'
import { COLORES, RADIOS, SOMBRAS } from 'src/theme'
import type { Pantalla } from 'src/types'

/** Desde estas pantallas se abre Información (el logo del encabezado). */
const PESTAÑAS: Pantalla[] = ['home', 'ranking', 'canjes', 'perfil']

const PILARES: { icono: LucideIcon; titulo: string; texto: string }[] = [
  { icono: Lightbulb, titulo: 'Innovación', texto: 'Una idea propia, pensada y construida por estudiantes.' },
  { icono: Cpu, titulo: 'Tecnología', texto: 'Electrónica, software y nube trabajando juntos.' },
  { icono: Leaf, titulo: 'Sustentabilidad', texto: 'Menos residuos y más conciencia ambiental.' },
]

const PARTES: { icono: LucideIcon; titulo: string; texto: string }[] = [
  {
    icono: Cpu,
    titulo: 'La caja recicladora',
    texto: 'Un ESP32 con lector de DNI y de códigos de barras identifica a cada estudiante y a cada residuo.',
  },
  {
    icono: Server,
    titulo: 'El servidor',
    texto: 'Valida cada reciclaje, calcula los puntos y los guarda de forma segura en la nube.',
  },
  {
    icono: Smartphone,
    titulo: 'Las apps',
    texto: 'Una para que reciclés, sigas tu progreso y canjees; otra para que el kiosco valide los canjes.',
  },
]

/** El propósito y la historia del proyecto. Se abre desde el logo del encabezado. */
export function PantallaInformacion() {
  const { navigate, pantallaAnterior } = useApp()
  const volver = () =>
    navigate(pantallaAnterior && PESTAÑAS.includes(pantallaAnterior) ? pantallaAnterior : 'home')

  return (
    <View style={estilos.pantalla}>
      <ScreenHeader title="Información" onBack={volver} />

      <ScrollView contentContainerStyle={estilos.contenido} showsVerticalScrollIndicator={false}>
        {/* Marca */}
        <View style={estilos.marca}>
          <TacherV2Logo size={88} halo />
          <View accessibilityRole="header">
            <MarcaTacherV2 tamanio={34} />
          </View>
          <Text style={estilos.lema}>Tecnología al servicio del reciclaje escolar</Text>
        </View>

        {/* Pilares */}
        <View style={estilos.pilares}>
          {PILARES.map(({ icono: Icono, titulo, texto }) => (
            <View key={titulo} style={estilos.pilar}>
              <View style={estilos.pilarIcono}>
                <Icono size={20} color={COLORES.oscuro} />
              </View>
              <Text style={estilos.pilarTitulo}>{titulo}</Text>
              <Text style={estilos.pilarTexto}>{texto}</Text>
            </View>
          ))}
        </View>

        <Bloque
          icono={CalendarDays}
          etiqueta="El proyecto"
          titulo="Un ciclo lectivo de trabajo"
          parrafos={[
            'TacherV2 nació como el proyecto técnico de todo un ciclo lectivo. A lo largo del año lo diseñamos, lo programamos, lo probamos y lo volvimos a mejorar, hasta convertirlo en un sistema real que funciona dentro de la escuela.',
            'Fue un desafío que nos obligó a unir todo lo que aprendimos: electrónica, programación, bases de datos y diseño. Cada etapa, desde el primer prototipo de la caja hasta esta app, es el resultado del trabajo en equipo y de muchas horas de dedicación.',
          ]}
        />

        <Bloque
          icono={Target}
          etiqueta="Nuestro propósito"
          titulo="Que reciclar sea un hábito"
          parrafos={[
            'Queremos que separar y reciclar residuos deje de ser una tarea olvidada y se vuelva parte del día a día de la escuela. Por eso cada reciclaje suma: los puntos se convierten en beneficios reales en el kiosco y el ranking invita a participar.',
            'Detrás de cada botella que entra en la caja hay una intención simple y grande a la vez: cuidar el ambiente que compartimos y demostrar que la tecnología puede ayudar a lograrlo.',
          ]}
        />

        <Bloque
          icono={GraduationCap}
          etiqueta="Escuela técnica y UBA"
          titulo="Hecho en nuestra comunidad educativa"
          parrafos={[
            'TacherV2 es un aporte de estudiantes de una escuela técnica vinculada a la Universidad de Buenos Aires. Refleja los valores que compartimos con la universidad: la formación técnica de calidad, el pensamiento crítico y el compromiso con la sociedad.',
            'Nuestra intención es que el proyecto quede como una herramienta útil para la escuela y como un punto de partida para que otras camadas lo sigan haciendo crecer.',
          ]}
          destacado
        />

        {/* Cómo funciona por dentro */}
        <View style={estilos.bloque}>
          <View style={estilos.bloqueCabecera}>
            <View style={estilos.bloqueIcono}>
              <HeartHandshake size={20} color={COLORES.principalOscuro} />
            </View>
            <View style={estilos.bloqueTextos}>
              <Text style={estilos.etiqueta}>Por dentro</Text>
              <Text style={estilos.bloqueTitulo}>Tres partes, un mismo sistema</Text>
            </View>
          </View>
          <View style={estilos.partes}>
            {PARTES.map(({ icono: Icono, titulo, texto }) => (
              <View key={titulo} style={estilos.parte}>
                <View style={estilos.parteIcono}>
                  <Icono size={18} color={COLORES.principal} />
                </View>
                <View style={estilos.parteTextos}>
                  <Text style={estilos.parteTitulo}>{titulo}</Text>
                  <Text style={estilos.parteTexto}>{texto}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <Text style={estilos.pie}>TacherV2 · Reciclá, sumá puntos y canjealos en el kiosco de tu escuela.</Text>
      </ScrollView>
    </View>
  )
}

interface BloqueProps {
  icono: LucideIcon
  etiqueta: string
  titulo: string
  parrafos: string[]
  /** Fondo oscuro de la marca, para el bloque que tiene que resaltar. */
  destacado?: boolean
}

function Bloque({ icono: Icono, etiqueta, titulo, parrafos, destacado = false }: BloqueProps) {
  return (
    <View style={[estilos.bloque, destacado && estilos.bloqueDestacado]}>
      {destacado && <View style={estilos.circuloDecorativo} />}
      <View style={estilos.bloqueCabecera}>
        <View style={[estilos.bloqueIcono, destacado && estilos.bloqueIconoDestacado]}>
          <Icono size={20} color={destacado ? COLORES.oscuro : COLORES.principalOscuro} />
        </View>
        <View style={estilos.bloqueTextos}>
          <Text style={[estilos.etiqueta, destacado && estilos.etiquetaDestacada]}>{etiqueta}</Text>
          <Text style={[estilos.bloqueTitulo, destacado && estilos.textoClaro]} accessibilityRole="header">
            {titulo}
          </Text>
        </View>
      </View>
      {parrafos.map((parrafo) => (
        <Text key={parrafo} style={[estilos.parrafo, destacado && estilos.parrafoDestacado]}>
          {parrafo}
        </Text>
      ))}
    </View>
  )
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },
  contenido: {
    gap: 18,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 36,
  },

  // --- Marca
  marca: {
    alignItems: 'center',
    gap: 12,
    paddingBottom: 4,
  },
  lema: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: COLORES.principalOscuro,
  },

  // --- Pilares
  pilares: {
    flexDirection: 'row',
    gap: 10,
  },
  pilar: {
    flex: 1,
    minWidth: 0,
    gap: 6,
    borderRadius: RADIOS.tarjeta,
    borderWidth: 1,
    borderColor: COLORES.linea,
    backgroundColor: COLORES.blanco,
    padding: 12,
    ...SOMBRAS.chica,
  },
  pilarIcono: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIOS.chico,
    backgroundColor: COLORES.acento,
  },
  pilarTitulo: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    color: COLORES.texto,
  },
  pilarTexto: {
    fontSize: 12,
    lineHeight: 16,
    color: COLORES.textoSuave,
  },

  // --- Bloques de texto
  bloque: {
    gap: 12,
    overflow: 'hidden',
    borderRadius: RADIOS.tarjeta,
    borderWidth: 1,
    borderColor: COLORES.linea,
    backgroundColor: COLORES.blanco,
    padding: 18,
    ...SOMBRAS.media,
  },
  bloqueDestacado: {
    borderWidth: 0,
    backgroundColor: COLORES.oscuro,
    ...SOMBRAS.marca,
  },
  circuloDecorativo: {
    position: 'absolute',
    top: -60,
    right: -50,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  bloqueCabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bloqueIcono: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIOS.medio,
    backgroundColor: COLORES.suave,
  },
  bloqueIconoDestacado: {
    backgroundColor: COLORES.acento,
  },
  bloqueTextos: {
    flex: 1,
    gap: 2,
  },
  etiqueta: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: COLORES.principal,
  },
  etiquetaDestacada: {
    color: COLORES.acento,
  },
  bloqueTitulo: {
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
    color: COLORES.texto,
  },
  textoClaro: {
    color: COLORES.blanco,
  },
  parrafo: {
    fontSize: 15,
    lineHeight: 23,
    color: COLORES.gris700,
  },
  parrafoDestacado: {
    color: COLORES.sobreOscuro,
  },

  // --- Partes del sistema
  partes: {
    gap: 12,
  },
  parte: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  parteIcono: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIOS.chico,
    backgroundColor: COLORES.suave,
  },
  parteTextos: {
    flex: 1,
    gap: 2,
  },
  parteTitulo: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: COLORES.texto,
  },
  parteTexto: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORES.gris600,
  },

  pie: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
    color: COLORES.textoSuave,
  },
})
