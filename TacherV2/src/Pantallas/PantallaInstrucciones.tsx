import React, { useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import {
  BookOpen,
  Coins,
  DoorClosed,
  Gift,
  IdCard,
  Lightbulb,
  MonitorCheck,
  PackagePlus,
  QrCode,
  Recycle,
  ScanLine,
  ShoppingBag,
  type LucideIcon,
} from 'lucide-react-native'
import { BotonPrimario } from 'src/components/BotonPrimario'
import { ScreenHeader } from 'src/components/ScreenHeader'
import { useApp } from 'src/context/AppContext'
import { COLORES, RADIOS, SOMBRAS } from 'src/theme'
import type { Pantalla } from 'src/types'

interface PasoGuia {
  icono: LucideIcon
  titulo: string
  detalle: string
}

interface Guia {
  id: 'reciclar' | 'canjear'
  pestaña: string
  icono: LucideIcon
  titulo: string
  descripcion: string
  pasos: PasoGuia[]
  consejo: string
  accion: { label: string; destino: Pantalla }
}

const GUIAS: Guia[] = [
  {
    id: 'reciclar',
    pestaña: 'Reciclar',
    icono: Recycle,
    titulo: '¿Cómo reciclar en la caja TacherV2?',
    descripcion: 'Cuatro pasos y tus puntos aparecen solos en la app.',
    pasos: [
      {
        icono: IdCard,
        titulo: 'Escaneá tu DNI',
        detalle: 'Acercá el código de barras de tu documento al lector de la caja para que sepa quién sos.',
      },
      {
        icono: PackagePlus,
        titulo: 'Depositá el residuo',
        detalle: 'Colocá el residuo en la recámara de la caja, con el código de barras a la vista.',
      },
      {
        icono: DoorClosed,
        titulo: 'Cerrá la puerta',
        detalle: 'Cerrá bien la puerta de la caja para que pueda procesar el residuo.',
      },
      {
        icono: MonitorCheck,
        titulo: 'Listo: sumás puntos',
        detalle:
          'La pantalla te muestra el valor del residuo, la caja lo pasa al tacho reciclador de abajo y los puntos se suman automáticamente a tu cuenta.',
      },
    ],
    consejo: 'Tus reciclajes y puntos se actualizan al instante. Los podés ver en Inicio y en tu historial.',
    accion: { label: 'Ver mi historial de reciclajes', destino: 'historial-reciclajes' },
  },
  {
    id: 'canjear',
    pestaña: 'Canjear',
    icono: Gift,
    titulo: '¿Cómo canjear tus puntos?',
    descripcion: 'Cambiá tus puntos por productos del kiosco de la escuela.',
    pasos: [
      {
        icono: Coins,
        titulo: 'Revisá tus puntos',
        detalle: 'Fijate que tengas los puntos necesarios para el producto que querés.',
      },
      {
        icono: ShoppingBag,
        titulo: 'Elegí el producto',
        detalle: 'Entrá a Canjes y seleccioná del catálogo el producto que querés canjear.',
      },
      {
        icono: QrCode,
        titulo: 'Generá el QR de canje',
        detalle: 'La app crea un código QR único para ese canje.',
      },
      {
        icono: ScanLine,
        titulo: 'Mostralo en la caja',
        detalle:
          'El cajero TacherV2 escanea tu QR, te descuenta los puntos y te entrega el producto.',
      },
    ],
    consejo: 'El QR vence a los 5 minutos. Generalo cuando ya estés por llegar a la caja.',
    accion: { label: 'Ir al catálogo de canjes', destino: 'canjes' },
  },
]

/** Cómo reciclar y cómo canjear, paso a paso. Se abre desde "Instrucciones" en Inicio. */
export function PantallaInstrucciones() {
  const { navigate } = useApp()
  const [guiaActiva, setGuiaActiva] = useState<Guia['id']>('reciclar')
  const guia = GUIAS.find((g) => g.id === guiaActiva) ?? GUIAS[0]
  const IconoGuia = guia.icono

  return (
    <View style={estilos.pantalla}>
      <ScreenHeader title="Instrucciones" onBack={() => navigate('home')} />

      <ScrollView contentContainerStyle={estilos.contenido} showsVerticalScrollIndicator={false}>
        {/* Cabecera oscura, como las demás pantallas destacadas */}
        <View style={estilos.hero}>
          <View style={estilos.circuloDecorativoGrande} />
          <View style={estilos.circuloDecorativoChico} />
          <View style={estilos.heroIcono}>
            <BookOpen size={28} color={COLORES.oscuro} />
          </View>
          <Text style={estilos.heroTitulo} accessibilityRole="header">
            Cómo usar TacherV2
          </Text>
          <Text style={estilos.heroTexto}>
            Reciclá en la caja, sumá puntos y canjealos en el kiosco. Elegí qué querés aprender.
          </Text>
        </View>

        {/* Selector Reciclar / Canjear */}
        <View style={estilos.selector} accessibilityRole="tablist">
          {GUIAS.map(({ id, pestaña, icono: Icono }) => {
            const activa = id === guiaActiva
            return (
              <TouchableOpacity
                key={id}
                activeOpacity={0.8}
                onPress={() => setGuiaActiva(id)}
                style={[estilos.opcion, activa && estilos.opcionActiva]}
                accessibilityRole="tab"
                accessibilityState={{ selected: activa }}
              >
                <Icono size={18} color={activa ? COLORES.blanco : COLORES.principalOscuro} />
                <Text style={[estilos.opcionTexto, activa && estilos.opcionTextoActiva]}>{pestaña}</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* La guía elegida */}
        <View style={estilos.guia}>
          <View style={estilos.guiaCabecera}>
            <View style={estilos.guiaIcono}>
              <IconoGuia size={22} color={COLORES.principalOscuro} />
            </View>
            <View style={estilos.guiaTextos}>
              <Text style={estilos.guiaTitulo} accessibilityRole="header">
                {guia.titulo}
              </Text>
              <Text style={estilos.guiaDescripcion}>{guia.descripcion}</Text>
            </View>
          </View>

          <View>
            {guia.pasos.map((paso, indice) => (
              <Paso
                key={paso.titulo}
                numero={indice + 1}
                paso={paso}
                esUltimo={indice === guia.pasos.length - 1}
              />
            ))}
          </View>

          <View style={estilos.consejo}>
            <Lightbulb size={20} color={COLORES.avisoOscuro} />
            <Text style={estilos.consejoTexto}>{guia.consejo}</Text>
          </View>
        </View>

        <BotonPrimario label={guia.accion.label} onPress={() => navigate(guia.accion.destino)} />
      </ScrollView>
    </View>
  )
}

function Paso({ numero, paso, esUltimo }: { numero: number; paso: PasoGuia; esUltimo: boolean }) {
  const Icono = paso.icono
  return (
    <View style={estilos.paso} accessible accessibilityLabel={`Paso ${numero}: ${paso.titulo}. ${paso.detalle}`}>
      <View style={estilos.pasoColumna}>
        <View style={estilos.pasoNumero}>
          <Text style={estilos.pasoNumeroTexto}>{numero}</Text>
        </View>
        {!esUltimo && <View style={estilos.pasoLinea} />}
      </View>

      <View style={[estilos.pasoTarjeta, !esUltimo && estilos.pasoTarjetaConEspacio]}>
        <View style={estilos.pasoTarjetaFila}>
          <View style={estilos.pasoIcono}>
            <Icono size={20} color={COLORES.principal} />
          </View>
          <Text style={estilos.pasoTitulo}>{paso.titulo}</Text>
        </View>
        <Text style={estilos.pasoDetalle}>{paso.detalle}</Text>
      </View>
    </View>
  )
}

const TAMANIO_NUMERO = 34

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },
  contenido: {
    gap: 18,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },

  // --- Cabecera
  hero: {
    gap: 8,
    overflow: 'hidden',
    borderRadius: RADIOS.grande,
    backgroundColor: COLORES.oscuro,
    padding: 22,
    ...SOMBRAS.marca,
  },
  circuloDecorativoGrande: {
    position: 'absolute',
    top: -70,
    right: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  circuloDecorativoChico: {
    position: 'absolute',
    bottom: -40,
    left: -30,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  heroIcono: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderRadius: RADIOS.medio,
    backgroundColor: COLORES.acento,
  },
  heroTitulo: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    letterSpacing: -0.6,
    color: COLORES.blanco,
  },
  heroTexto: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORES.sobreOscuro,
  },

  // --- Selector
  selector: {
    flexDirection: 'row',
    gap: 6,
    borderRadius: RADIOS.tarjeta,
    borderWidth: 1,
    borderColor: COLORES.linea,
    backgroundColor: COLORES.blanco,
    padding: 6,
    ...SOMBRAS.chica,
  },
  opcion: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: RADIOS.boton,
    paddingVertical: 12,
  },
  opcionActiva: {
    backgroundColor: COLORES.principal,
    ...SOMBRAS.media,
  },
  opcionTexto: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: COLORES.principalOscuro,
  },
  opcionTextoActiva: {
    color: COLORES.blanco,
  },

  // --- Guía
  guia: {
    gap: 20,
    borderRadius: RADIOS.tarjeta,
    borderWidth: 1,
    borderColor: COLORES.linea,
    backgroundColor: COLORES.blanco,
    padding: 18,
    ...SOMBRAS.media,
  },
  guiaCabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  guiaIcono: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIOS.medio,
    backgroundColor: COLORES.suave,
  },
  guiaTextos: {
    flex: 1,
    gap: 2,
  },
  guiaTitulo: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '800',
    letterSpacing: -0.3,
    color: COLORES.texto,
  },
  guiaDescripcion: {
    fontSize: 13,
    lineHeight: 18,
    color: COLORES.textoSuave,
  },

  // --- Pasos
  paso: {
    flexDirection: 'row',
    gap: 12,
  },
  pasoColumna: {
    width: TAMANIO_NUMERO,
    alignItems: 'center',
  },
  pasoNumero: {
    width: TAMANIO_NUMERO,
    height: TAMANIO_NUMERO,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: TAMANIO_NUMERO / 2,
    backgroundColor: COLORES.oscuro,
  },
  pasoNumeroTexto: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    color: COLORES.acento,
  },
  pasoLinea: {
    flex: 1,
    width: 2,
    marginVertical: 4,
    borderRadius: 1,
    backgroundColor: COLORES.verde200,
  },
  pasoTarjeta: {
    flex: 1,
    gap: 6,
    borderRadius: RADIOS.medio,
    backgroundColor: COLORES.fondo,
    borderWidth: 1,
    borderColor: COLORES.linea,
    padding: 12,
  },
  pasoTarjetaConEspacio: {
    marginBottom: 12,
  },
  pasoTarjetaFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pasoIcono: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIOS.chico,
    backgroundColor: COLORES.suave,
  },
  pasoTitulo: {
    flex: 1,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
    color: COLORES.texto,
  },
  pasoDetalle: {
    fontSize: 14,
    lineHeight: 21,
    color: COLORES.gris600,
  },

  // --- Consejo
  consejo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: RADIOS.medio,
    borderWidth: 1,
    borderColor: COLORES.aviso200,
    backgroundColor: COLORES.aviso50,
    padding: 12,
  },
  consejoTexto: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: COLORES.avisoOscuro,
  },
})
