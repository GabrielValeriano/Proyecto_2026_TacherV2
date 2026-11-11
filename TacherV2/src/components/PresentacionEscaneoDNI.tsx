import React, { type ReactNode } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { IdCard, ScanLine, type LucideIcon } from 'lucide-react-native'
import { BotonPrimario } from 'src/components/BotonPrimario'
import { MensajeError } from 'src/components/MensajeError'
import { COLORES, SOMBRAS } from 'src/theme'

export interface AvisoDNI {
  icon: LucideIcon
  text: string
}

interface Props {
  titulo: string
  descripcion: string
  avisos: AvisoDNI[]
  /** Algo extra debajo de la descripción (por ejemplo, el DNI actual). */
  detalle?: ReactNode
  error?: string
  labelBoton: string
  onEscanear: () => void
  cargando?: boolean
}

/**
 * Pantalla previa a abrir la cámara del DNI (registro y "Actualizar DNI").
 * Letra grande y alto contraste: la usan también personas mayores o con poca visión.
 */
export function PresentacionEscaneoDNI({
  titulo,
  descripcion,
  avisos,
  detalle,
  error,
  labelBoton,
  onEscanear,
  cargando = false,
}: Props) {
  return (
    <ScrollView contentContainerStyle={estilos.contenido}>
      <View style={estilos.cuerpo}>
        <View style={estilos.iconoPrincipal}>
          <IdCard size={48} strokeWidth={1.75} color={COLORES.verde700} />
        </View>

        <View style={estilos.textos}>
          <Text style={estilos.titulo} accessibilityRole="header">
            {titulo}
          </Text>
          <Text style={estilos.descripcion}>{descripcion}</Text>
        </View>

        {detalle}

        <View style={estilos.avisos}>
          {avisos.map(({ icon: Icono, text }) => (
            <View key={text} style={estilos.aviso}>
              <View style={estilos.avisoIcono}>
                <Icono size={26} color={COLORES.verde700} />
              </View>
              <Text style={estilos.avisoTexto}>{text}</Text>
            </View>
          ))}
        </View>

        <MensajeError message={error} />
      </View>

      <BotonPrimario
        label={labelBoton}
        onPress={onEscanear}
        loading={cargando}
        disabled={cargando}
        icon={!cargando ? <ScanLine size={22} color={COLORES.blanco} /> : undefined}
        style={estilos.boton}
      />
    </ScrollView>
  )
}

/** Chip con el DNI vinculado, para "Actualizar DNI". */
export function DniActual({ dni, icono: Icono }: { dni: string; icono: LucideIcon }) {
  return (
    <View style={estilos.dniActual}>
      <Icono size={22} color={COLORES.verde700} />
      <Text style={estilos.dniActualTexto}>
        DNI actual: <Text style={estilos.dniActualValor}>{dni}</Text>
      </Text>
    </View>
  )
}

const estilos = StyleSheet.create({
  contenido: {
    flexGrow: 1,
    justifyContent: 'space-between',
    gap: 28,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 32,
  },
  cuerpo: {
    gap: 24,
  },
  iconoPrincipal: {
    alignSelf: 'center',
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORES.verde200,
    backgroundColor: COLORES.suave,
    ...SOMBRAS.chica,
  },
  textos: {
    gap: 10,
  },
  titulo: {
    textAlign: 'center',
    fontSize: 26,
    lineHeight: 33,
    fontWeight: '800',
    letterSpacing: -0.4,
    color: COLORES.gris900,
  },
  descripcion: {
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 27,
    color: COLORES.gris700,
  },
  dniActual: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: COLORES.verde200,
    backgroundColor: COLORES.suave,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  dniActualTexto: {
    fontSize: 17,
    lineHeight: 24,
    color: COLORES.gris700,
  },
  dniActualValor: {
    fontWeight: '800',
    color: COLORES.gris900,
  },
  avisos: {
    gap: 14,
  },
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORES.verde200,
    backgroundColor: COLORES.blanco,
    paddingVertical: 16,
    paddingHorizontal: 16,
    ...SOMBRAS.chica,
  },
  avisoIcono: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: COLORES.suave,
  },
  avisoTexto: {
    flex: 1,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '500',
    color: COLORES.gris800,
  },
  boton: {
    minHeight: 60,
  },
})
