import React, { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { AlertCircle, RotateCcw } from 'lucide-react-native'
import type { ErrorBoundaryProps } from 'expo-router'
import { BotonPrimario } from 'src/components/BotonPrimario'
import { COLORES, RADIOS, SOMBRAS } from 'src/theme'

/**
 * Pantalla que aparece si la app se rompe. El detalle técnico va a la consola;
 * al cajero le mostramos un mensaje claro y un botón para reintentar.
 */
export const FeedBackPorDefecto = ({ error, retry }: ErrorBoundaryProps) => {
  useEffect(() => {
    console.error('Error no controlado en la app del cajero:', error)
  }, [error])

  return (
    <View style={estilos.pantalla}>
      <View style={estilos.tarjeta}>
        <View style={estilos.icono}>
          <AlertCircle size={36} color={COLORES.rojo600} />
        </View>
        <Text style={estilos.titulo} accessibilityRole="header">
          Algo salió mal
        </Text>
        <Text style={estilos.texto}>
          Ocurrió un problema inesperado. Tocá “Reintentar” y, si sigue pasando, cerrá y volvé a abrir la app.
        </Text>
        <BotonPrimario
          label="Reintentar"
          onPress={retry}
          icon={<RotateCcw size={18} color={COLORES.blanco} />}
        />
      </View>
    </View>
  )
}

export default FeedBackPorDefecto

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: COLORES.fondo,
    padding: 24,
  },
  tarjeta: {
    alignItems: 'center',
    gap: 14,
    borderRadius: RADIOS.grande,
    borderWidth: 1,
    borderColor: COLORES.linea,
    backgroundColor: COLORES.blanco,
    padding: 24,
    ...SOMBRAS.media,
  },
  icono: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 36,
    backgroundColor: COLORES.rojo50,
  },
  titulo: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    color: COLORES.texto,
  },
  texto: {
    marginBottom: 6,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    color: COLORES.textoSuave,
  },
})
