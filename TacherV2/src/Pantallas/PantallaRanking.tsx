import React from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { Crown, Recycle, Sparkles, Trophy } from 'lucide-react-native'
import { BarraDeNavegacion } from 'src/components/BarraDeNavegacion'
import { Encabezado } from 'src/components/Encabezado'
import { MensajeError } from 'src/components/MensajeError'
import { useApp } from 'src/context/AppContext'
import { getRangoParaPuntos, RANGOS, type Rango } from 'src/domain/rangos'
import { useNavegacionPestañas } from 'src/hooks/useNavegacionPestañas'
import { useRanking } from 'src/hooks/useRanking'
import type { PuestoRanking } from 'src/services/ranking'
import { COLORES, SOMBRAS } from 'src/theme'

/** Orden de las columnas: segundo, primero, tercero (el primero va al medio). */
const ORDEN_PODIO = [1, 0, 2]
const ALTURAS_PODIO = [124, 92, 68]
const MEDALLAS = [COLORES.acento, '#CBD5D0', '#D79A63'] // oro, plata, bronce

/** Qué representa cada rango. La clave es el nombre del rango en domain/rangos.ts. */
const GUIA_RANGOS: Record<string, { titulo: string; descripcion: string }> = {
  Brote: {
    titulo: 'Brote',
    descripcion: 'Estás empezando. Cada botella que reciclás es una semilla que empieza a crecer.',
  },
  Planta: {
    titulo: 'Planta',
    descripcion: 'Ya tenés el hábito. Tu constancia empieza a dar frutos en toda la escuela.',
  },
  Arbol: {
    titulo: 'Árbol',
    descripcion: 'Sos un referente. Tu impacto es duradero y le da sombra a toda la comunidad.',
  },
}

/** Cada rango se ve más intenso que el anterior: claro, medio y oscuro. */
const TEMAS_RANGO = [
  {
    fondo: COLORES.suave,
    borde: COLORES.linea,
    circulo: COLORES.principal,
    icono: COLORES.blanco,
    titulo: COLORES.texto,
    texto: COLORES.textoSuave,
    pildoraFondo: COLORES.blanco,
    pildoraTexto: COLORES.verde700,
  },
  {
    fondo: COLORES.principal,
    borde: COLORES.principal,
    circulo: 'rgba(255,255,255,0.22)',
    icono: COLORES.blanco,
    titulo: COLORES.blanco,
    texto: 'rgba(255,255,255,0.9)',
    pildoraFondo: 'rgba(255,255,255,0.22)',
    pildoraTexto: COLORES.blanco,
  },
  {
    fondo: COLORES.oscuro,
    borde: COLORES.oscuro,
    circulo: COLORES.acento,
    icono: COLORES.oscuro,
    titulo: COLORES.blanco,
    texto: COLORES.sobreOscuro,
    pildoraFondo: 'rgba(255,255,255,0.14)',
    pildoraTexto: COLORES.acento,
  },
]

// ---------------------------------------------------------------------------
// Adornos y Skeletons
// ---------------------------------------------------------------------------

function Destello({
  posicion,
  tamaño = 18,
}: {
  posicion: StyleProp<ViewStyle>
  tamaño?: number
}) {
  return (
    <View style={[estilos.destello, posicion]}>
      <Sparkles size={tamaño} color={COLORES.acento} />
    </View>
  )
}

function Trofeo() {
  return (
    <View style={estilos.trofeoContenedor}>
      <View style={estilos.trofeoHalo} />
      <View style={estilos.trofeoCirculo}>
        <Trophy size={44} color={COLORES.oscuro} />
      </View>
    </View>
  )
}

/** Componente Skeleton individual para cada columna del podio */
function ColumnaPodioSkeleton({ indice }: { indice: number }) {
  const tamañoAvatar = indice === 0 ? 76 : 60

  return (
    <View style={estilos.columna}>
      <View style={estilos.datosPuesto}>
        <View
          style={[
            estilos.avatar,
            estilos.skeletonBase,
            {
              width: tamañoAvatar,
              height: tamañoAvatar,
              borderRadius: tamañoAvatar / 2,
            },
          ]}
        />
        <View style={[estilos.skeletonBase, estilos.skeletonTextoNombrePodio]} />
      </View>
      <View
        style={[
          estilos.bloque,
          estilos.skeletonBase,
          { height: ALTURAS_PODIO[indice] },
        ]}
      />
    </View>
  )
}

/** Podio Skeleton completo */
function PodioSkeleton() {
  return (
    <View style={estilos.podio}>
      {ORDEN_PODIO.map((indice) => (
        <ColumnaPodioSkeleton key={indice} indice={indice} />
      ))}
    </View>
  )
}

// ---------------------------------------------------------------------------
// Podio (top 3) real
// ---------------------------------------------------------------------------

interface ColumnaPodioProps {
  indice: number
  puesto?: PuestoRanking
  esUsuario: boolean
}

function ColumnaPodio({ indice, puesto, esUsuario }: ColumnaPodioProps) {
  const medalla = MEDALLAS[indice]
  const tamañoAvatar = indice === 0 ? 76 : 60

  return (
    <View style={estilos.columna}>
      <View style={estilos.datosPuesto}>
        {indice === 0 && puesto && <Crown size={30} color={COLORES.acento} />}
        {esUsuario && <Text style={estilos.etiquetaVos}>Vos</Text>}

        <View
          style={[
            estilos.avatar,
            {
              width: tamañoAvatar,
              height: tamañoAvatar,
              borderRadius: tamañoAvatar / 2,
              borderColor: medalla,
            },
            !puesto && estilos.avatarVacio,
          ]}
        >
          <Text style={[estilos.avatarInicial, indice === 0 && estilos.avatarInicialGrande]}>
            {puesto ? puesto.nombre.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>

        <Text style={estilos.nombrePodio} numberOfLines={1}>
          {puesto ? puesto.nombre : 'Libre'}
        </Text>

        {puesto && (
          <View style={[estilos.cantidadPodio, { backgroundColor: medalla }]}>
            <Recycle size={14} color={COLORES.oscuro} />
            <Text style={estilos.cantidadPodioTexto}>{puesto.cantidad.toLocaleString('es-AR')}</Text>
          </View>
        )}
      </View>

      <View
        style={[
          estilos.bloque,
          { height: ALTURAS_PODIO[indice], backgroundColor: medalla },
          !puesto && estilos.bloqueVacio,
        ]}
      >
        <Text style={estilos.numeroPuesto}>{indice + 1}</Text>
      </View>
    </View>
  )
}

function Podio({ puestos, usuarioId }: { puestos: PuestoRanking[]; usuarioId?: string }) {
  return (
    <View style={estilos.podio}>
      {ORDEN_PODIO.map((indice) => (
        <ColumnaPodio
          key={indice}
          indice={indice}
          puesto={puestos[indice]}
          esUsuario={Boolean(usuarioId) && puestos[indice]?.id === usuarioId}
        />
      ))}
    </View>
  )
}

// ---------------------------------------------------------------------------
// Puestos 4 y 5
// ---------------------------------------------------------------------------

interface FilaPuestoProps {
  puesto: PuestoRanking
  posicion: number
  esUsuario: boolean
}

function FilaPuesto({ puesto, posicion, esUsuario }: FilaPuestoProps) {
  return (
    <View style={[estilos.fila, esUsuario && estilos.filaUsuario]}>
      <View style={estilos.posicionCirculo}>
        <Text style={estilos.posicionTexto}>{posicion}</Text>
      </View>

      <View style={estilos.filaTextos}>
        <Text style={estilos.filaNombre} numberOfLines={1}>
          {puesto.nombre}
        </Text>
        {esUsuario && (
          <View style={estilos.insigniaVos}>
            <Text style={estilos.insigniaVosTexto}>Vos</Text>
          </View>
        )}
      </View>

      <View style={estilos.cantidadFila}>
        <Recycle size={18} color={COLORES.verde700} />
        <Text style={estilos.cantidadFilaTexto}>{puesto.cantidad.toLocaleString('es-AR')}</Text>
      </View>
    </View>
  )
}

// ---------------------------------------------------------------------------
// Guía de rangos
// ---------------------------------------------------------------------------

function TarjetaRango({ rango, indice, esActual }: { rango: Rango; indice: number; esActual: boolean }) {
  const tema = TEMAS_RANGO[Math.min(indice, TEMAS_RANGO.length - 1)]
  const guia = GUIA_RANGOS[rango.name] ?? {
    titulo: rango.name,
    descripcion: 'Seguí reciclando para llegar todavía más lejos.',
  }
  const Icono = rango.icon
  const requisito =
    rango.min === 0 ? 'Desde tu primer reciclaje' : `Desde ${rango.min.toLocaleString('es-AR')} puntos`

  return (
    <View style={[estilos.tarjetaRango, { backgroundColor: tema.fondo, borderColor: tema.borde }]}>
      <View style={[estilos.circuloRango, { backgroundColor: tema.circulo }]}>
        <Icono size={32} color={tema.icono} />
      </View>

      <View style={estilos.rangoTextos}>
        <View style={estilos.rangoEncabezado}>
          <Text style={[estilos.rangoNombre, { color: tema.titulo }]}>{guia.titulo}</Text>
          {esActual && (
            <View style={estilos.insigniaTuRango}>
              <Text style={estilos.insigniaTuRangoTexto}>Tu rango</Text>
            </View>
          )}
        </View>

        <View style={[estilos.pildoraRango, { backgroundColor: tema.pildoraFondo }]}>
          <Text style={[estilos.pildoraRangoTexto, { color: tema.pildoraTexto }]}>{requisito}</Text>
        </View>

        <Text style={[estilos.rangoDescripcion, { color: tema.texto }]}>{guia.descripcion}</Text>
      </View>
    </View>
  )
}

function GuiaRangos({ indiceActual }: { indiceActual: number }) {
  return (
    <View style={estilos.guia}>
      <View style={estilos.guiaEncabezado}>
        <Text style={estilos.tituloSeccion}>Guía de rangos</Text>
        <Text style={estilos.subtituloSeccion}>
          Cada reciclaje en la caja te da puntos. Sumalos y hacé crecer tu rango.
        </Text>
      </View>

      {RANGOS.map((rango, indice) => (
        <TarjetaRango key={rango.name} rango={rango} indice={indice} esActual={indice === indiceActual} />
      ))}
    </View>
  )
}

// ---------------------------------------------------------------------------
// Pantalla
// ---------------------------------------------------------------------------

export function PantallaRanking() {
  const { userData } = useApp()
  const handleTabPress = useNavegacionPestañas()
  const { puestos, cargando, error } = useRanking()

  const puntos = Number(userData?.Puntos) || 0
  const indiceRango = RANGOS.indexOf(getRangoParaPuntos(puntos))
  const podio = puestos.slice(0, 3)
  const restantes = puestos.slice(3, 5)

  return (
    <View style={estilos.pantalla}>
      <Encabezado />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={estilos.hero}>
          <View style={estilos.circuloDecorativoUno} />
          <View style={estilos.circuloDecorativoDos} />
          <Destello posicion={estilos.destelloUno} tamaño={22} />
          <Destello posicion={estilos.destelloDos} />
          <Destello posicion={estilos.destelloTres} tamaño={16} />
          <Destello posicion={estilos.destelloCuatro} tamaño={20} />

          <Trofeo />

          <Text style={estilos.titulo}>
            Ranking de{'\n'}
            <Text style={estilos.tituloAcento}>recicladores</Text>
          </Text>
          <Text style={estilos.subtituloHero}>Los 10 que más reciclan en la caja TeacherV2</Text>

          {cargando ? (
            <PodioSkeleton />
          ) : error ? (
            <View style={estilos.estadoHero}>
              <MensajeError message={error} />
            </View>
          ) : podio.length === 0 ? (
            <Text style={estilos.sinRanking}>
              Todavía no hay recicladores en el ranking. ¡Podés ser el primero!
            </Text>
          ) : (
            <Podio puestos={podio} usuarioId={userData?.id} />
          )}
        </View>

        <View style={estilos.cuerpo}>
          {restantes.length > 0 && (
            <View style={estilos.seccionFilas}>
              <Text style={estilos.etiquetaSeccion}>Siguen en el top 10</Text>
              {restantes.map((puesto, indice) => (
                <FilaPuesto
                  key={puesto.id}
                  puesto={puesto}
                  posicion={indice + 4}
                  esUsuario={Boolean(userData?.id) && puesto.id === userData?.id}
                />
              ))}
            </View>
          )}

          <GuiaRangos indiceActual={indiceRango} />
        </View>
      </ScrollView>

      <BarraDeNavegacion activeTab="ranking" onTabPress={handleTabPress} />
    </View>
  )
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },

  // --- Zona oscura de arriba
  hero: {
    alignItems: 'center',
    overflow: 'hidden',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    backgroundColor: COLORES.oscuro,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  circuloDecorativoUno: {
    position: 'absolute',
    left: -70,
    top: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORES.principal,
    opacity: 0.25,
  },
  circuloDecorativoDos: {
    position: 'absolute',
    right: -80,
    bottom: 70,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: COLORES.principal,
    opacity: 0.18,
  },
  destello: {
    position: 'absolute',
    opacity: 0.75,
  },
  destelloUno: {
    left: 28,
    top: 30,
  },
  destelloDos: {
    right: 34,
    top: 64,
  },
  destelloTres: {
    left: 52,
    top: 190,
  },
  destelloCuatro: {
    right: 26,
    top: 230,
  },
  trofeoContenedor: {
    width: 116,
    height: 116,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trofeoHalo: {
    position: 'absolute',
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: COLORES.acento,
    opacity: 0.22,
  },
  trofeoCirculo: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 44,
    backgroundColor: COLORES.acento,
    ...SOMBRAS.grande,
  },
  titulo: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 40,
    lineHeight: 46,
    fontWeight: '800',
    letterSpacing: -1.2,
    color: COLORES.blanco,
  },
  tituloAcento: {
    color: COLORES.acento,
  },
  subtituloHero: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    color: COLORES.sobreOscuro,
  },
  cargando: {
    marginTop: 40,
    marginBottom: 20,
  },
  estadoHero: {
    width: '100%',
    marginTop: 24,
  },
  sinRanking: {
    marginTop: 28,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    color: COLORES.sobreOscuro,
  },

  // --- Podio
  podio: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 10,
    marginTop: 32,
  },
  columna: {
    flex: 1,
    alignItems: 'center',
  },
  datosPuesto: {
    width: '100%',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  etiquetaVos: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: COLORES.acento,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  avatarVacio: {
    borderStyle: 'dashed',
    opacity: 0.5,
  },
  avatarInicial: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: COLORES.blanco,
  },
  avatarInicialGrande: {
    fontSize: 32,
    lineHeight: 38,
  },
  nombrePodio: {
    width: '100%',
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: COLORES.blanco,
  },
  cantidadPodio: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  cantidadPodioTexto: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
    color: COLORES.oscuro,
  },
  bloque: {
    width: '100%',
    alignItems: 'center',
    overflow: 'hidden',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: 8,
  },
  bloqueVacio: {
    opacity: 0.3,
  },
  numeroPuesto: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '800',
    color: COLORES.oscuro,
    opacity: 0.75,
  },

  // --- Zona clara de abajo
  cuerpo: {
    gap: 28,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  seccionFilas: {
    gap: 10,
  },
  etiquetaSeccion: {
    fontSize: 30,
    lineHeight: 50,
    fontWeight: '600',
    color: COLORES.texto,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORES.linea,
    backgroundColor: COLORES.blanco,
    padding: 14,
    ...SOMBRAS.chica,
  },
  filaUsuario: {
    borderWidth: 2,
    borderColor: COLORES.acento,
  },
  posicionCirculo: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: COLORES.oscuro,
  },
  posicionTexto: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    color: COLORES.blanco,
  },
  filaTextos: {
    flex: 1,
    gap: 4,
  },
  filaNombre: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
    color: COLORES.texto,
  },
  insigniaVos: {
    alignSelf: 'flex-start',
    borderRadius: 9999,
    backgroundColor: COLORES.acento,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  insigniaVosTexto: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: COLORES.oscuro,
  },
  cantidadFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 9999,
    backgroundColor: COLORES.suave,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  cantidadFilaTexto: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    color: COLORES.verde700,
  },

  // --- Guía de rangos
  guia: {
    gap: 25,
  },
  guiaEncabezado: {
    gap: 10,
  },
  tituloSeccion: {
    fontSize: 30,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: -0.7,
    color: COLORES.texto,
  },
  subtituloSeccion: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORES.textoSuave,
  },
  tarjetaRango: {
    flexDirection: 'row',
    gap: 16,
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
  },
  circuloRango: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
  },
  rangoTextos: {
    flex: 1,
    gap: 8,
  },
  rangoEncabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  rangoNombre: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  insigniaTuRango: {
    borderRadius: 9999,
    backgroundColor: COLORES.acento,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  insigniaTuRangoTexto: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: COLORES.oscuro,
  },
  pildoraRango: {
    alignSelf: 'flex-start',
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  pildoraRangoTexto: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  rangoDescripcion: {
    fontSize: 15,
    lineHeight: 22,
  },

  // --- Estilos Skeleton
  skeletonBase: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  skeletonTextoNombrePodio: {
    width: '70%',
    height: 14,
    borderRadius: 4,
    marginTop: 4,
  },
})