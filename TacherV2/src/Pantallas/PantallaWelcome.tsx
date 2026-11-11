import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { BotonPrimario } from 'src/components/BotonPrimario'
import { MarcaTacherV2, TacherV2Logo } from 'src/components/TacherV2Logo'
import { COLORES } from 'src/theme'
import { useApp } from 'src/context/AppContext'

export function PantallaWelcome() {
  const { navigate } = useApp()

  return (
    <View style={estilos.pantalla}>
      {/* Fondo: dos círculos muy suaves para que no sea un blanco plano */}
      <View style={estilos.circuloFondoGrande} />
      <View style={estilos.circuloFondoChico} />

      <View style={estilos.marca}>
        <TacherV2Logo size={128} halo />

        <View style={estilos.textos}>
          <View accessibilityRole="header">
            <MarcaTacherV2 tamanio={44} />
          </View>
          <Text style={estilos.eslogan}>Reciclar con un propósito</Text>
          <Text style={estilos.descripcion}>
            Sumá puntos reciclando en tu escuela y canjealos por recompensas increíbles.
          </Text>
        </View>
      </View>

      <View style={estilos.botones}>
        <BotonPrimario
          label="Iniciar Sesión"
          onPress={() => navigate('login-email')} />
        <BotonPrimario
          label="Registrarse"
          variante="contorno"
          onPress={() => navigate('register-email')}
        />
      </View>
    </View>
  )
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    justifyContent: 'space-between',
    overflow: 'hidden',
    backgroundColor: COLORES.fondo,
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 48,
  },

  // --- Fondo
  circuloFondoGrande: {
    position: 'absolute',
    top: -140,
    right: -120,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: COLORES.suave,
    opacity: 0.6,
  },
  circuloFondoChico: {
    position: 'absolute',
    top: 220,
    left: -90,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORES.suave,
    opacity: 0.35,
  },

  // --- Logo y textos
  marca: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 36,
    paddingBottom: 32,
  },
  textos: {
    alignItems: 'center',
    gap: 10,
  },
  eslogan: {
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: COLORES.verde700,
  },
  descripcion: {
    maxWidth: 320,
    marginTop: 4,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 23,
    color: COLORES.textoSuave,
  },

  // --- Botones (sin cambios)
  botones: {
    width: '100%',
    gap: 12,
  },
})
