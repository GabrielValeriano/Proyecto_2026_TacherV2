import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { BotonPrimario } from 'src/components/BotonPrimario'
import { TeacherV2Logo } from 'src/components/TeacherV2Logo'
import { COLORES } from 'src/theme'
import { useApp } from 'src/context/AppContext'

export function PantallaWelcome() {
  const { navigate } = useApp()

  return (
    <View style={estilos.pantalla}>
      <View style={estilos.encabezado}>
        <View style={estilos.marcaLogo}>
          <TeacherV2Logo size={72} withWordmark />
        </View>
        <View style={estilos.bloqueTextos}>
          <Text style={estilos.titulo}>Reciclar Con Un Propósito</Text>
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
    backgroundColor: COLORES.blanco,
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 64,
  },
  encabezado: {
    alignItems: 'center',
    gap: 24,
  },
  marcaLogo: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORES.verde200,
    backgroundColor: COLORES.verde50,
    padding: 24,
  },
  bloqueTextos: {
    alignItems: 'center',
    gap: 8,
  },
  titulo: {
    textAlign: 'center',
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: -0.6,
    color: COLORES.gris900,
  },
  descripcion: {
    textAlign: 'center',
    paddingHorizontal: 16,
    fontSize: 14,
    lineHeight: 22.75,
    color: COLORES.gris500,
  },
  botones: {
    width: '100%',
    gap: 12,
  },
})
