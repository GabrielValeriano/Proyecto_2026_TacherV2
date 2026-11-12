// Copia de TacherV2/src/components/TransicionVerde.tsx: si cambiás uno, cambiá el otro para que las dos apps se vean iguales.
import React, { useEffect, useRef } from 'react'
import { AccessibilityInfo, Animated, Easing, StyleSheet, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { COLORES } from 'src/theme'

/**
 * Transición de éxito tipo Mercado Pago: un círculo verde crece desde la esquina inferior izquierda
 * hasta cubrir la pantalla y se desvanece, dejando el fondo blanco. Después el contenido entra
 * con EntradaSuave. La usan el recibo de canje (cliente) y el resultado del canje (cajero).
 */

const DURACION_EXPANSION_MS = 650
const DURACION_DESVANECER_MS = 320
const DURACION_ENTRADA_MS = 420

/**
 * Un círculo verde crece desde la esquina inferior izquierda hasta cubrir la pantalla y después
 * se desvanece, dejando el fondo blanco. Al terminar llama a `onTerminar`.
 * Si el teléfono tiene "reducir movimiento", se saltea la transición.
 */
export function useTransicionVerde(onTerminar: () => void) {
  const escala = useRef(new Animated.Value(0)).current
  const opacidad = useRef(new Animated.Value(1)).current
  const onTerminarRef = useRef(onTerminar)
  onTerminarRef.current = onTerminar

  useEffect(() => {
    let activo = true
    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reducir) => {
        if (!activo) return
        if (reducir) {
          opacidad.setValue(0)
          onTerminarRef.current()
          return
        }
        Animated.sequence([
          Animated.timing(escala, {
            toValue: 1,
            duration: DURACION_EXPANSION_MS,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(opacidad, {
            toValue: 0,
            duration: DURACION_DESVANECER_MS,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start(({ finished }) => {
          if (finished && activo) onTerminarRef.current()
        })
      })
    return () => {
      activo = false
    }
  }, [escala, opacidad])

  return { escala, opacidad }
}

export function CapaVerde({ escala, opacidad }: { escala: Animated.Value; opacidad: Animated.Value }) {
  const { width, height: alturaVentana } = useWindowDimensions()
  const { top, bottom } = useSafeAreaInsets()
  // La pantalla va dentro de la zona segura: su borde de abajo está a esta altura
  const height = alturaVentana - top - bottom
  // Radio suficiente para cubrir toda la pantalla desde la esquina (la diagonal, con margen)
  const radio = Math.ceil(Math.hypot(width, alturaVentana)) + 40
  // Las franjas de la barra de estado y de abajo (fuera de la zona segura) se pintan cuando el
  // círculo ya casi cubre la pantalla, y se desvanecen junto con él
  const opacidadFranjas = Animated.multiply(
    escala.interpolate({ inputRange: [0, 0.8, 1], outputRange: [0, 0, 1] }),
    opacidad,
  )

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[estilos.franja, { top: -top, height: top, opacity: opacidadFranjas }]}
      />
      <Animated.View
        pointerEvents="none"
        style={[estilos.franja, { bottom: -bottom, height: bottom, opacity: opacidadFranjas }]}
      />
      <Animated.View
      pointerEvents="none"
      style={[
        estilos.capaVerde,
        {
          width: radio * 2,
          height: radio * 2,
          borderRadius: radio,
          left: -radio,
          top: height - radio,
          opacity: opacidad,
          transform: [{ scale: escala }],
        },
      ]}
      />
    </>
  )
}

/** Entrada suave del contenido: aparece y sube un poco. */
export function EntradaSuave({ demora = 0, children }: { demora?: number; children: React.ReactNode }) {
  const valor = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(valor, {
      toValue: 1,
      duration: DURACION_ENTRADA_MS,
      delay: demora,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start()
  }, [demora, valor])

  const translateY = valor.interpolate({ inputRange: [0, 1], outputRange: [24, 0] })
  return <Animated.View style={{ opacity: valor, transform: [{ translateY }] }}>{children}</Animated.View>
}

const estilos = StyleSheet.create({
  capaVerde: {
    position: 'absolute',
    backgroundColor: COLORES.principal,
  },
  franja: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: COLORES.principal,
  },
})
