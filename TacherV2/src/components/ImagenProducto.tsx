import React, { useState } from 'react'
import { Image, StyleSheet, View, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native'
import { Gift } from 'lucide-react-native'
import { COLORES } from 'src/theme'

interface Props {
  uri: string | null
  /** Bordes redondeados, bordes, etc. Por defecto es un cuadrado del ancho disponible. */
  style?: StyleProp<ImageStyle>
  tamañoIcono?: number
}

/** Imagen cuadrada de un producto. Si no hay imagen o falla la carga, muestra un ícono de regalo. */
export function ImagenProducto({ uri, style, tamañoIcono = 32 }: Props) {
  const [fallo, setFallo] = useState(false)

  if (!uri || fallo) {
    return (
      <View style={[estilos.base, estilos.vacia, style as StyleProp<ViewStyle>]}>
        <Gift size={tamañoIcono} color={COLORES.verde} />
      </View>
    )
  }

  return (
    <Image
      source={{ uri }}
      style={[estilos.base, style]}
      resizeMode="cover"
      onError={() => setFallo(true)}
    />
  )
}

const estilos = StyleSheet.create({
  base: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: COLORES.verde100,
  },
  vacia: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})
