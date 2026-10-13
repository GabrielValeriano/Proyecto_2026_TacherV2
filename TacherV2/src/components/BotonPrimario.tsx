import React, { type ReactNode } from 'react'
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { COLORES, SOMBRAS } from 'src/theme'

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
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={loading || disabled}
      style={[estilos.boton, boton, disabled && estilos.botonDeshabilitado, style]}
    >
      {loading ? (
        <ActivityIndicator color={spinner} />
      ) : (
        <>
          {icon}
          <Text style={[estilos.texto, texto, disabled && estilos.textoDeshabilitado]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  )
}

const estilos = StyleSheet.create({
  boton: {
    width: '100%',
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    ...SOMBRAS.chica,
  },
  botonSolido: {
    backgroundColor: COLORES.verde600,
  },
  botonContorno: {
    borderWidth: 1,
    borderColor: COLORES.verde600,
    backgroundColor: COLORES.blanco,
  },
  botonPeligro: {
    backgroundColor: COLORES.rojo600,
  },
  botonDeshabilitado: {
    borderColor: COLORES.gris200,
    backgroundColor: COLORES.gris200,
  },
  texto: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  textoClaro: {
    color: COLORES.blanco,
  },
  textoVerde: {
    color: COLORES.verde600,
  },
  textoDeshabilitado: {
    color: COLORES.gris400,
  },
})
