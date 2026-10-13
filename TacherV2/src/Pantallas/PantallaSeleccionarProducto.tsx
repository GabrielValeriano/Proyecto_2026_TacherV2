import React from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { QrCode } from 'lucide-react-native'
import { BotonPrimario } from 'src/components/BotonPrimario'
import { ImagenProducto } from 'src/components/ImagenProducto'
import { ScreenHeader } from 'src/components/ScreenHeader'
import { useApp } from 'src/context/AppContext'
import { COLORES } from 'src/theme'

export function PantallaSeleccionarProducto() {
  const { productoSeleccionado, userData, navigate } = useApp()

  const volverACanjes = () => navigate('canjes')

  if (!productoSeleccionado) {
    return (
      <View style={estilos.pantalla}>
        <ScreenHeader title="Seleccionar producto" onBack={volverACanjes} />
        <View style={estilos.sinProducto}>
          <Text style={estilos.sinProductoTexto}>No hay ningún producto seleccionado.</Text>
          <BotonPrimario
            label="Volver a canjes"
            onPress={volverACanjes}
            style={estilos.botonVolver}
          />
        </View>
      </View>
    )
  }

  const { imagen, nombre, puntos, descripcion } = productoSeleccionado

  const puntosDelUsuario = Number(userData?.Puntos) || 0
  const puntosFaltantes = Math.max(0, puntos - puntosDelUsuario)
  const alcanzanLosPuntos = puntosFaltantes === 0

  const handleGenerarQr = () => {
    if (!alcanzanLosPuntos) return
    navigate('generar-qr')
  }

  return (
    <View style={estilos.pantalla}>
      <ScreenHeader title="Seleccionar producto" onBack={volverACanjes} />

      <ScrollView contentContainerStyle={estilos.contenido}>
        <ImagenProducto uri={imagen} style={estilos.imagen} tamañoIcono={64} />

        <View style={estilos.datos}>
          <Text style={estilos.nombre}>{nombre}</Text>
          <View style={estilos.chipPuntos}>
            <Text style={estilos.textoPuntos}>{puntos.toLocaleString('es-AR')} puntos</Text>
          </View>
        </View>

        <View style={estilos.seccionDescripcion}>
          <Text style={estilos.subtitulo}>Descripción</Text>
          <Text style={estilos.descripcion}>
            {descripcion || 'Este producto todavía no tiene descripción.'}
          </Text>
        </View>
      </ScrollView>

      <View style={estilos.pie}>
        {!alcanzanLosPuntos && (
          <Text style={estilos.avisoPuntos}>
            Te {puntosFaltantes === 1 ? 'falta' : 'faltan'} {puntosFaltantes.toLocaleString('es-AR')}{' '}
            {puntosFaltantes === 1 ? 'punto' : 'puntos'} para canjear este producto.
          </Text>
        )}
        <BotonPrimario
          label="Generar QR"
          icon={
            <QrCode size={20} color={alcanzanLosPuntos ? COLORES.blanco : COLORES.gris400} />
          }
          disabled={!alcanzanLosPuntos}
          onPress={handleGenerarQr}
        />
      </View>
    </View>
  )
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: COLORES.blanco,
  },
  contenido: {
    gap: 20,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 20,
  },
  imagen: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORES.verde200,
  },

  // --- Datos del producto
  datos: {
    gap: 12,
  },
  nombre: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.7,
    color: COLORES.gris900,
  },
  chipPuntos: {
    alignSelf: 'flex-start',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: COLORES.verde200,
    backgroundColor: COLORES.verde100,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  textoPuntos: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
    color: COLORES.verde700,
  },
  seccionDescripcion: {
    gap: 8,
  },
  subtitulo: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.45,
    color: COLORES.gris900,
  },
  descripcion: {
    fontSize: 14,
    lineHeight: 22.75,
    color: COLORES.gris600,
  },

  // --- Botón fijo abajo
  pie: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: COLORES.verde100,
    backgroundColor: COLORES.blanco,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  avisoPuntos: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: COLORES.gris500,
  },

  // --- Sin producto seleccionado
  sinProducto: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  sinProductoTexto: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    color: COLORES.gris500,
  },
  botonVolver: {
    width: 'auto',
    paddingHorizontal: 24,
  },
})
