// Copia de TacherV2/src/components/TacherV2Logo.tsx: si cambiás uno, cambiá el otro para que las dos apps se vean iguales.
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Recycle } from 'lucide-react-native'
import { CirculoMarca } from 'src/components/CirculoMarca'
import { COLORES } from 'src/theme'

interface Props {
  /** Diámetro del círculo. Todo lo demás (ícono, anillos) se escala con esto. */
  size?: number
  /** Anillos suaves alrededor: para el logo grande (bienvenida, carga). */
  halo?: boolean
  /** Muestra "TacherV2" debajo del logo. */
  withWordmark?: boolean
}

/**
 * Logo oficial de TacherV2: círculo con el degradé de la marca y el ícono de reciclaje.
 * Es el mismo en la bienvenida, la carga y el encabezado.
 */
export function TacherV2Logo({ size = 44, halo = false, withWordmark = false }: Props) {
  const logo = (
    <CirculoMarca size={size}>
      <Recycle size={size * 0.5} strokeWidth={2} color={COLORES.blanco} />
    </CirculoMarca>
  )

  const conHalo = halo ? (
    <View
      style={[
        estilos.halo,
        { width: size * 1.5, height: size * 1.5, borderRadius: (size * 1.5) / 2 },
      ]}
    >
      <View
        style={[
          estilos.haloInterno,
          { width: size * 1.23, height: size * 1.23, borderRadius: (size * 1.23) / 2 },
        ]}
      >
        {logo}
      </View>
    </View>
  ) : (
    logo
  )

  return (
    <View style={estilos.contenedor} accessible accessibilityRole="image" accessibilityLabel="TacherV2">
      {conHalo}
      {withWordmark && <MarcaTacherV2 tamanio={Math.max(22, Math.round(size * 0.34))} />}
    </View>
  )
}

/**
 * El nombre "TacherV2" con la misma tipografía en toda la app.
 * `claro` = para fondos oscuros como el banner: "Tacher" en blanco y "V2" en verde lima.
 * Sobre fondos claros: "Tacher" oscuro y "V2" en el verde de la marca, para que se lea bien.
 */
export function MarcaTacherV2({ tamanio = 26, claro = false }: { tamanio?: number; claro?: boolean }) {
  return (
    <Text
      style={[
        estilos.nombre,
        {
          fontSize: tamanio,
          lineHeight: Math.round(tamanio * 1.15),
          letterSpacing: -tamanio * 0.034,
          color: claro ? COLORES.blanco : COLORES.texto,
        },
      ]}
      accessibilityLabel="TacherV2"
    >
      Tacher<Text style={{ color: claro ? COLORES.acento : COLORES.principal }}>V2</Text>
    </Text>
  )
}

const estilos = StyleSheet.create({
  contenedor: {
    alignItems: 'center',
    gap: 20,
  },
  halo: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(38,130,87,0.06)',
  },
  haloInterno: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORES.verde200,
    backgroundColor: 'rgba(38,130,87,0.08)',
  },
  nombre: {
    textAlign: 'center',
    fontWeight: '800',
  },
})
