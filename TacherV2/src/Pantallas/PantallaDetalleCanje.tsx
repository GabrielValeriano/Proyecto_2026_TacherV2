import React from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Coins, Lock, QrCode, X } from 'lucide-react-native'
import { BotonPrimario } from 'src/components/BotonPrimario'
import { Encabezado } from 'src/components/Encabezado'
import { ImagenProducto } from 'src/components/ImagenProducto'
import { TarjetaPuntosCanjes } from 'src/components/TarjetaPuntosCanjes'
import { useApp } from 'src/context/AppContext'
import { COLORES, RADIOS } from 'src/theme'

/**
 * Detalle del producto elegido en Canjes, en su propia pantalla. Es el mismo panel que antes se
 * abría encima de Canjes: de fondo se ve el banner y la tarjeta de puntos, oscurecidos, y el
 * panel del producto encima. Volver siempre lleva a Canjes sin ningún producto seleccionado.
 */
export function PantallaDetalleCanje() {
  const { userData, navigate, seleccionarProducto, productoSeleccionado } = useApp()
  const puntos = Number(userData?.Puntos) || 0

  const volverACanjes = () => {
    seleccionarProducto(null)
    navigate('canjes')
  }

  // Sin producto (por ejemplo, si se llegó acá sin elegir uno) no hay nada que mostrar
  if (!productoSeleccionado) {
    return (
      <View style={estilos.pantalla}>
        <Encabezado />
        <View style={estilos.sinProducto}>
          <Text style={estilos.sinProductoTexto}>No hay ningún producto seleccionado.</Text>
          <BotonPrimario label="Volver a canjes" onPress={volverACanjes} />
        </View>
      </View>
    )
  }

  const puntosDelUsuario = puntos
  const puntosFaltantes = Math.max(0, productoSeleccionado.puntos - puntosDelUsuario)
  const alcanzanLosPuntos = puntosFaltantes === 0

  const handleGenerarQr = () => {
    if (!alcanzanLosPuntos) return
    navigate('generar-qr')
  }

  return (
    <View style={estilos.pantalla}>
      {/* Fondo: lo de arriba de Canjes (banner y tarjeta de puntos), que queda oscurecido */}
      <Encabezado />
      <View style={estilos.fondo} pointerEvents="none">
        <TarjetaPuntosCanjes puntos={puntos} onCanjesHistorial={() => {}} />
      </View>

      {/* El mismo panel del producto que se abría encima de Canjes */}
      <View style={estilos.contenedorOverlay}>
        <View style={estilos.modalCard}>
          
          {/* Cabecera con botón X a la izquierda y título centrado */}
          <View style={estilos.cabeceraModal}>
            <TouchableOpacity onPress={volverACanjes} style={estilos.botonCerrar}   activeOpacity={0.7}>
              <X size={24} color={COLORES.gris900} />
            </TouchableOpacity>
            <Text style={estilos.tituloCabecera}>Detalle de canje</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Contenido scrolleable del modal */}
          <ScrollView contentContainerStyle={estilos.contenidoModal} showsVerticalScrollIndicator={false}>
            <ImagenProducto uri={productoSeleccionado.imagen} style={estilos.imagenModal} />

            <View style={estilos.datosModal}>
              <View
                style={[
                  estilos.chipPuntosModal,
                  !alcanzanLosPuntos ? estilos.chipPuntosBloqueado : estilos.chipPuntosDisponible,
                ]}
              >
                {!alcanzanLosPuntos ? (
                  <Lock size={16} color={COLORES.avisoOscuro} />
                ) : (
                  <Coins size={16} color={COLORES.verde700} />
                )}
                <Text
                  style={[
                    estilos.textoPuntosModal,
                    !alcanzanLosPuntos ? estilos.textoPuntosBloqueado : estilos.textoPuntosDisponible,
                  ]}
                >
                  {productoSeleccionado.puntos.toLocaleString('es-AR')} Puntos
                </Text>
              </View>
              <Text style={estilos.nombreModal}>{productoSeleccionado.nombre}</Text>
            </View>


            {/* Barra de progreso y texto de puntos faltantes mejorado */}
            {!alcanzanLosPuntos && (
              <View style={estilos.seccionFaltantesModal}>
                <Text style={estilos.avisoPuntosModal}>
                  Te {puntosFaltantes === 1 ? 'falta' : 'faltan'}{' '}
                  <Text style={estilos.textoResaltadoFaltante}>
                    {puntosFaltantes.toLocaleString('es-AR')} {puntosFaltantes === 1 ? 'punto' : 'puntos'}
                  </Text>{' '}
                  para canjear este producto.
                </Text>
                <View style={estilos.barraProgresoFondo}>
                  <View 
                    style={[
                      estilos.barraProgresoRellenaAmarilla, 
                      { width: `${Math.min(100, (puntosDelUsuario / productoSeleccionado.puntos) * 100)}%` }
                    ]} 
                  />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Pie con los 2 botones inferiores */}
          <View style={estilos.pieModal}>
            <BotonPrimario
              label="Generar QR"
              icon={
                <QrCode size={20} color={alcanzanLosPuntos ? COLORES.blanco : COLORES.gris400} />
              }
              disabled={!alcanzanLosPuntos}
              onPress={handleGenerarQr}
            />
            <TouchableOpacity
              style={estilos.botonSecundarioModal}
              activeOpacity={0.8}
              onPress={volverACanjes}
            >
              <Text style={estilos.textoBotonSecundarioModal}>Ver los demás productos</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </View>
  )
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },
  // Mismo margen que el contenido de Canjes, para que el fondo se vea igual
  fondo: {
    paddingHorizontal: 16,
    paddingTop: 16,
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
    fontSize: 16,
    lineHeight: 22,
    color: COLORES.textoSuave,
  },

  // --- ESTILOS DEL MODAL SUPERPUESTO (Bottom Sheet) ---
  contenedorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORES.overlay,
    justifyContent: 'flex-end',
    zIndex: 999,
  },
  modalCard: {
    height: '90%',
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
    borderBottomColor: COLORES.linea,
  },
  botonCerrar: {
    padding: 4,
  },
  tituloCabecera: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORES.gris900,
  },
  contenidoModal: {
    gap: 20,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  imagenModal: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORES.verde200,
    height: 450,
    width: '100%',
  },
  datosModal: {
    gap: 10,
    alignItems: 'center',
  },
  nombreModal: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    textAlign: 'center',
    color: COLORES.gris900,
  },
  chipPuntosModal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 9999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  chipPuntosDisponible: {
    backgroundColor: COLORES.verde100,
    borderColor: COLORES.verde200,
  },
  chipPuntosBloqueado: {
    backgroundColor: COLORES.aviso50,
    borderColor: COLORES.aviso200,
  },
  textoPuntosModal: {
    fontSize: 14,
    fontWeight: '700',
  },
  textoPuntosDisponible: {
    color: COLORES.verde700,
  },
  textoPuntosBloqueado: {
    color: COLORES.avisoOscuro,
  },
  seccionDescripcionModal: {
    alignItems: 'center',
  },
  descripcionModal: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    color: COLORES.gris600,
  },
  seccionFaltantesModal: {
    gap: 8,
    marginTop: 4,
  },
  barraProgresoFondo: {
    height: 8,
    backgroundColor: COLORES.gris200,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barraProgresoRellenaAmarilla: {
    height: '100%',
    backgroundColor: COLORES.aviso500, // Ámbar de aviso
    borderRadius: 4,
  },
  avisoPuntosModal: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: COLORES.gris600,
  },
  textoResaltadoFaltante: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORES.avisoOscuro, // Ámbar oscuro, resaltado
  },
  pieModal: {
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORES.linea,
    backgroundColor: COLORES.blanco,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  botonSecundarioModal: {
    borderRadius: RADIOS.boton,
    borderWidth: 1.5,
    borderColor: COLORES.principal,
    backgroundColor: COLORES.blanco,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotonSecundarioModal: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORES.principal,
  },
})
