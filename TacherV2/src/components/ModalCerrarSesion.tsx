import React from 'react'
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { LogOut } from 'lucide-react-native'
import { BotonPrimario } from 'src/components/BotonPrimario'
import { COLORES, SOMBRAS } from 'src/theme'

interface Props {
  visible: boolean
  onCancelar: () => void
  onConfirmar: () => void
  cargando?: boolean
}

export function ModalCerrarSesion({ visible, onCancelar, onConfirmar, cargando = false }: Props) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancelar}
      statusBarTranslucent
    >
      <View style={estilos.overlay}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={onCancelar}
          disabled={cargando}
          style={StyleSheet.absoluteFill}
        />
        <View style={estilos.cardContainer} pointerEvents="box-none">
          <View style={estilos.card}>
            <View style={estilos.iconoContenedor}>
              <LogOut size={28} color={COLORES.rojo600} />
            </View>
            <Text style={estilos.titulo}>Cerrar sesión</Text>
            <Text style={estilos.descripcion}>
              ¿Estás seguro de que querés cerrar tu sesión?
            </Text>
            <View style={estilos.acciones}>
              <BotonPrimario
                label="Cancelar"
                onPress={onCancelar}
                variante="contorno"
                style={estilos.botonSecundario}
                disabled={cargando}
              />
              <BotonPrimario
                label={cargando ? 'Cerrando...' : 'Cerrar sesión'}
                onPress={onConfirmar}
                variante="peligro"
                style={estilos.botonPrincipal}
                loading={cargando}
                disabled={cargando}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const estilos = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORES.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  cardContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderRadius: 28,
    backgroundColor: COLORES.blanco,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    gap: 12,
    ...SOMBRAS.grande,
  },
  iconoContenedor: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    backgroundColor: COLORES.rojo50,
  },
  titulo: {
    marginTop: 4,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    color: COLORES.texto,
  },
  descripcion: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    color: COLORES.textoSuave,
    paddingHorizontal: 8,
  },
  acciones: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  botonSecundario: {
    flex: 1,
    width: undefined,
    borderColor: COLORES.linea,
    backgroundColor: COLORES.blanco,
  },
  botonPrincipal: {
    flex: 1,
    width: undefined,
  },
})
