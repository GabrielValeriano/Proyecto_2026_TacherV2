import React from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { QrCode, X, Coins } from 'lucide-react-native'
import { BotonPrimario } from 'src/components/BotonPrimario'
import { ImagenProducto } from 'src/components/ImagenProducto'
import { useApp } from 'src/context/AppContext'
import { COLORES, RADIOS } from 'src/theme'

export function PantallaSeleccionarProducto() {
  const { productoSeleccionado, userData, navigate } = useApp()

  const volverACanjes = () => navigate('canjes')

  if (!productoSeleccionado) {
    return (
      <View style={estilos.contenedorOverlay}>
        <View style={estilos.modalCard}>
          <View style={estilos.cabeceraModal}>
            <TouchableOpacity onPress={volverACanjes} style={estilos.botonCerrar}>
              <X size={24} color={COLORES.gris900} />
            </TouchableOpacity>
            <Text style={estilos.tituloCabecera}>Detalle de canje</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={estilos.sinProducto}>
            <Text style={estilos.sinProductoTexto}>No hay ningún producto seleccionado.</Text>
            <BotonPrimario
              label="Volver a canjes"
              onPress={volverACanjes}
              style={estilos.botonVolver}
            />
          </View>
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
    <View style={estilos.contenedorOverlay}>
      {/* Tarjeta modal flotante superpuesta */}
      <View style={estilos.modalCard}>
        
        {/* Cabecera con botón X a la izquierda y título centrado */}
        <View style={estilos.cabeceraModal}>
          <TouchableOpacity onPress={volverACanjes} style={estilos.botonCerrar} activeOpacity={0.7}>
            <X size={24} color={COLORES.gris900} />
          </TouchableOpacity>
          <Text style={estilos.tituloCabecera}>Detalle de canje</Text>
          <View style={{ width: 24 }} /> {/* Espaciador simétrico */}
        </View>

        {/* Contenido principal scrolleable */}
        <ScrollView contentContainerStyle={estilos.contenido} showsVerticalScrollIndicator={false}>
          <ImagenProducto uri={imagen} style={estilos.imagen} tamañoIcono={64} />

          <View style={estilos.datos}>
            <View style={estilos.chipPuntos}>
              <Coins size={16} color={COLORES.verde700} />
              <Text style={estilos.textoPuntos}>{puntos.toLocaleString('es-AR')} Puntos</Text>
            </View>
            <Text style={estilos.nombre}>{nombre}</Text>
          </View>

          <View style={estilos.seccionDescripcion}>
            <Text style={estilos.descripcion}>
              {descripcion || 'Este producto todavía no tiene descripción.'}
            </Text>
          </View>

          {/* Barra de progreso / aviso de puntos faltantes */}
          {!alcanzanLosPuntos && (
            <View style={estilos.seccionFaltantes}>
              <View style={estilos.barraProgresoFondo}>
                <View 
                  style={[
                    estilos.barraProgresoRellena, 
                    { width: `${Math.min(100, (puntosDelUsuario / puntos) * 100)}%` }
                  ]} 
                />
              </View>
              <Text style={estilos.avisoPuntos}>
                Te {puntosFaltantes === 1 ? 'falta' : 'faltan'} {puntosFaltantes.toLocaleString('es-AR')}{' '}
                {puntosFaltantes === 1 ? 'punto' : 'puntos'} para canjear este producto.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Pie con los 2 botones solicitados */}
        <View style={estilos.pie}>
          <BotonPrimario
            label="Generar QR"
            icon={
              <QrCode size={20} color={alcanzanLosPuntos ? COLORES.blanco : COLORES.gris400} />
            }
            disabled={!alcanzanLosPuntos}
            onPress={handleGenerarQr}
          />
          <TouchableOpacity
            style={estilos.botonSecundario}
            activeOpacity={0.8}
            onPress={volverACanjes}
          >
            <Text style={estilos.textoBotonSecundario}>Ver los demás productos</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  )
}

const estilos = StyleSheet.create({
  contenedorOverlay: {
    flex: 1,
    backgroundColor: COLORES.overlay, // Fondo oscuro translúcido superpuesto
    justifyContent: 'flex-end', // Ancla el modal abajo estilo Bottom Sheet
  },
  modalCard: {
    height: '92%', // Ocupa casi toda la altura de la pantalla
    backgroundColor: COLORES.blanco,
    borderTopLeftRadius: RADIOS.grande,
    borderTopRightRadius: RADIOS.grande,
    overflow: 'hidden',
    flexDirection: 'column',
  },
  cabeceraModal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORES.verde100,
  },
  botonCerrar: {
    padding: 4,
  },
  tituloCabecera: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORES.gris900,
  },
  contenido: {
    gap: 20,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  imagen: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORES.verde200,
    height: 180,
  },
  datos: {
    gap: 10,
    alignItems: 'center',
  },
  nombre: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    textAlign: 'center',
    color: COLORES.gris900,
  },
  chipPuntos: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: COLORES.verde200,
    backgroundColor: COLORES.verde100,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  textoPuntos: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORES.verde700,
  },
  seccionDescripcion: {
    alignItems: 'center',
  },
  descripcion: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    color: COLORES.gris600,
  },
  seccionFaltantes: {
    gap: 8,
    marginTop: 4,
  },
  barraProgresoFondo: {
    height: 6,
    backgroundColor: COLORES.gris200,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barraProgresoRellena: {
    height: '100%',
    backgroundColor: COLORES.principal,
    borderRadius: 3,
  },
  avisoPuntos: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '500',
    color: COLORES.gris500,
  },
  pie: {
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORES.verde100,
    backgroundColor: COLORES.blanco,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  botonSecundario: {
    borderRadius: RADIOS.boton,
    borderWidth: 1.5,
    borderColor: COLORES.principal,
    backgroundColor: COLORES.blanco,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotonSecundario: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORES.principal,
  },
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
    color: COLORES.gris500,
  },
  botonVolver: {
    width: 'auto',
    paddingHorizontal: 24,
  },
})
