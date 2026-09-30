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

type Variante = 'solido' | 'contorno'

interface Props {
  label: string
  onPress: () => void
  loading?: boolean
  icon?: ReactNode
  variante?: Variante
  /** Estilo extra (márgenes, ancho...). Por defecto ocupa todo el ancho. */
  style?: StyleProp<ViewStyle>
}

export function BotonPrimario({
  label,
  onPress,
  loading = false,
  icon,
  variante = 'solido',
  style,
}: Props) {
  const esSolido = variante === 'solido'

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={loading}
      style={[estilos.boton, esSolido ? estilos.botonSolido : estilos.botonContorno, style]}
    >
      {loading ? (
        <ActivityIndicator color={esSolido ? COLORES.blanco : COLORES.verde600} />
      ) : (
        <>
          {icon}
          <Text style={[estilos.texto, esSolido ? estilos.textoSolido : estilos.textoContorno]}>
            {label}
          </Text>
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
  texto: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  textoSolido: {
    color: COLORES.blanco,
  },
  textoContorno: {
    color: COLORES.verde600,
  },
})
