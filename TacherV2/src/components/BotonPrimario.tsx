import React, { type ReactNode } from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { COLORES, RADIOS, SOMBRAS } from 'src/theme'

type Variante = 'solido' | 'contorno' | 'peligro'

interface Props {
  label: string
  onPress: () => void
  loading?: boolean
  /** Botón gris que no responde al toque. */
  disabled?: boolean
  icon?: ReactNode
  variante?: Variante
  /** Estilo extra (márgenes, ancho...). Por defecto ocupa todo el ancho. */
  style?: StyleProp<ViewStyle>
}

export function BotonPrimario({
  label,
  onPress,
  loading = false,
  disabled = false,
  icon,
  variante = 'solido',
  style,
}: Props) {
  const { boton, texto, spinner } = {
    solido: { boton: estilos.botonSolido, texto: estilos.textoClaro, spinner: COLORES.blanco },
    contorno: { boton: estilos.botonContorno, texto: estilos.textoVerde, spinner: COLORES.verde600 },
    peligro: { boton: estilos.botonPeligro, texto: estilos.textoClaro, spinner: COLORES.blanco },
  }[variante]

  return (
    <Pressable
      onPress={onPress}
      disabled={loading || disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: loading || disabled, busy: loading }}
      style={({ pressed }) => [
        estilos.boton,
        boton,
        disabled && estilos.botonDeshabilitado,
        pressed && estilos.botonPresionado,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={spinner} />
      ) : (
        <>
          {icon}
          <Text style={[estilos.texto, texto, disabled && estilos.textoDeshabilitado]}>{label}</Text>
        </>
      )}
    </Pressable>
  )
}

const estilos = StyleSheet.create({
  boton: {
    width: '100%',
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: RADIOS.boton,
    paddingHorizontal: 16,
  },
  botonSolido: {
    backgroundColor: COLORES.principal,
    ...SOMBRAS.marca,
  },
  botonContorno: {
    borderWidth: 1.5,
    borderColor: COLORES.principal,
    backgroundColor: COLORES.blanco,
    ...SOMBRAS.chica,
  },
  botonPeligro: {
    backgroundColor: COLORES.rojo600,
    shadowColor: COLORES.rojo600,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  // Al tocarlo se achica apenas y baja la sombra: se siente como un botón real
  botonPresionado: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.08,
    elevation: 1,
  },
  botonDeshabilitado: {
    borderColor: COLORES.gris200,
    backgroundColor: COLORES.gris200,
    shadowOpacity: 0,
    elevation: 0,
  },
  texto: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  textoClaro: {
    color: COLORES.blanco,
  },
  textoVerde: {
    color: COLORES.principal,
  },
  textoDeshabilitado: {
    color: COLORES.gris400,
  },
})
