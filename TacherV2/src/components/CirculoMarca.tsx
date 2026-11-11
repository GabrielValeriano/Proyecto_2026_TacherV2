import React, { useId, type ReactNode } from 'react'
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'
import { COLORES, DEGRADE_MARCA, SOMBRAS } from 'src/theme'

interface CirculoMarcaProps {
  size: number
  children?: ReactNode
  /** Borde alrededor del círculo (por ejemplo, para resaltar al usuario en el ranking). */
  borde?: { color: string; ancho: number }
  sombra?: boolean
  /** Radio de borde. Por defecto es la mitad del tamaño (círculo); con menos queda un cuadrado redondeado. */
  radio?: number
  style?: StyleProp<ViewStyle>
}

/**
 * El círculo de la marca: degradé verde en diagonal con el contenido centrado.
 * Es la base del logo, del botón de notificaciones y de los avatares, así todos se ven iguales.
 */
export function CirculoMarca({ size, children, borde, sombra = true, radio: radioPropio, style }: CirculoMarcaProps) {
  // Cada círculo necesita su propio id de degradé (puede haber varios en pantalla)
  const idDegrade = `degradeMarca${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const radio = radioPropio ?? size / 2

  return (
    <View
      style={[
        estilos.base,
        { borderRadius: radio },
        sombra && (size >= 80 ? SOMBRAS.marca : SOMBRAS.media),
        style,
      ]}
    >
      <View
        style={[
          estilos.circulo,
          { width: size, height: size, borderRadius: radio },
          borde && { borderWidth: borde.ancho, borderColor: borde.color },
        ]}
      >
        <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id={idDegrade} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={DEGRADE_MARCA.desde} />
              <Stop offset="1" stopColor={DEGRADE_MARCA.hasta} />
            </LinearGradient>
          </Defs>
          <Rect width={size} height={size} fill={`url(#${idDegrade})`} />
        </Svg>
        {children}
      </View>
    </View>
  )
}

interface AvatarInicialProps {
  /** Lo que se muestra adentro: una o dos letras ya calculadas. */
  texto: string
  size: number
  borde?: CirculoMarcaProps['borde']
  sombra?: boolean
  /** Contenido alternativo si `texto` está vacío (por ejemplo, un ícono). */
  alternativa?: ReactNode
}

/** Avatar con la(s) inicial(es) del usuario sobre el círculo de la marca. */
export function AvatarInicial({ texto, size, borde, sombra, alternativa }: AvatarInicialProps) {
  return (
    <CirculoMarca size={size} borde={borde} sombra={sombra}>
      {texto ? (
        <Text
          style={[
            estilos.inicial,
            { fontSize: Math.round(size * 0.4), lineHeight: Math.round(size * 0.48) },
          ]}
          allowFontScaling={false}
        >
          {texto}
        </Text>
      ) : (
        alternativa
      )}
    </CirculoMarca>
  )
}

const estilos = StyleSheet.create({
  base: {
    // Mismo color que el final del degradé: la sombra necesita fondo y así no se ve un filo claro
    backgroundColor: DEGRADE_MARCA.hasta,
  },
  circulo: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  inicial: {
    fontWeight: '800',
    letterSpacing: 0.5,
    color: COLORES.blanco,
  },
})
