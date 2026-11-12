import React, { useEffect, useRef } from 'react'
import { Animated, StyleSheet } from 'react-native'
import { Check } from 'lucide-react-native'
import { COLORES, SOMBRAS } from 'src/theme'

/** Ícono de éxito: círculo verde sólido de la marca con el check blanco, con un rebote al aparecer. */
export function IconoExito({ tamanio = 84 }: { tamanio?: number }) {
  const escala = useRef(new Animated.Value(0.6)).current

  useEffect(() => {
    Animated.spring(escala, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }).start()
  }, [escala])

  return (
    <Animated.View
      style={[
        estilos.circulo,
        { width: tamanio, height: tamanio, borderRadius: tamanio / 2, transform: [{ scale: escala }] },
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Check size={Math.round(tamanio * 0.52)} strokeWidth={3.25} color={COLORES.blanco} />
    </Animated.View>
  )
}

const estilos = StyleSheet.create({
  circulo: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORES.principal,
    ...SOMBRAS.marca,
  },
})
