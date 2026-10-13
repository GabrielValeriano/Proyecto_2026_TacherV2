import React, { useEffect } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import { Clock, RefreshCw } from 'lucide-react-native'
import { BotonPrimario } from 'src/components/BotonPrimario'
import { MensajeError } from 'src/components/MensajeError'
import { TituloDePantalla } from 'src/components/TituloDePantalla'
import { useApp } from 'src/context/AppContext'
import { useCanjeQr } from 'src/hooks/useCanjeQr'
import { useSegundosRestantes } from 'src/hooks/useSegundosRestantes'
import { COLORES, SOMBRAS } from 'src/theme'
import { formatearTiempo } from 'src/utils/fechas'

const SEGUNDOS_URGENTE = 60

export function PantallaGenerarQr() {
  const { productoSeleccionado, userData, navigate } = useApp()
  const { width } = useWindowDimensions()
  const { canje, cargando, error, finalizado, cancelar, regenerar } = useCanjeQr(
    productoSeleccionado,
    userData,
  )

  const segundosRestantes = useSegundosRestantes(canje?.vence ?? null)
  const vencido = canje !== null && segundosRestantes === 0
  const tamañoQr = Math.min(width - 96, 300)

  // Cuando el cajero finaliza el canje, pasamos solos al recibo
  useEffect(() => {
    if (finalizado) navigate('recibo-canje')
  }, [finalizado])

  const handleCancelar = async () => {
    await cancelar()
    navigate('seleccionar-producto')
  }

  if (!productoSeleccionado) {
    return (
      <View style={estilos.sinProducto}>
        <Text style={estilos.sinProductoTexto}>No hay ningún producto seleccionado.</Text>
        <BotonPrimario
          label="Volver a canjes"
          onPress={() => navigate('canjes')}
          style={estilos.botonVolver}
        />
      </View>
    )
  }

  const { nombre, puntos } = productoSeleccionado

  return (
    <View style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.contenido}>
        <View style={estilos.encabezado}>
          <TituloDePantalla texto="Tu QR de canje" />
          <Text style={estilos.subtitulo}>Mostráselo al cajero del kiosco</Text>
        </View>

        {error ? (
          <MensajeError message={error} />
        ) : (
          <View style={estilos.tarjetaQr}>
            {cargando || !canje ? (
              <View style={[estilos.espacioQr, { width: tamañoQr, height: tamañoQr }]}>
                <ActivityIndicator size="large" color={COLORES.verde} />
              </View>
            ) : vencido ? (
              <View style={[estilos.espacioQr, { width: tamañoQr, height: tamañoQr }]}>
                <Clock size={48} color={COLORES.gris400} />
                <Text style={estilos.textoVencido}>Este QR venció</Text>
              </View>
            ) : (
              <QRCode
                value={canje.id}
                size={tamañoQr}
                color={COLORES.gris900}
                backgroundColor={COLORES.blanco}
              />
            )}
          </View>
        )}

        <View style={estilos.resumen}>
          <Text style={estilos.nombreProducto}>{nombre}</Text>
          <View style={estilos.chipPuntos}>
            <Text style={estilos.textoPuntos}>{puntos.toLocaleString('es-AR')} puntos</Text>
          </View>

          {canje && !vencido && (
            <View style={estilos.vence}>
              <Clock size={14} color={COLORES.gris500} />
              <Text
                style={[
                  estilos.venceTexto,
                  segundosRestantes <= SEGUNDOS_URGENTE && estilos.venceUrgente,
                ]}
              >
                Vence en {formatearTiempo(segundosRestantes)}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={estilos.pie}>
        {(vencido || error !== '') && (
          <BotonPrimario
            label={vencido ? 'Generar QR nuevo' : 'Reintentar'}
            icon={<RefreshCw size={18} color={COLORES.blanco} />}
            onPress={regenerar}
          />
        )}
        <BotonPrimario label="Cancelar canje" variante="contorno" onPress={handleCancelar} />
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
    alignItems: 'center',
    gap: 24,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 32,
  },
  encabezado: {
    alignItems: 'center',
    gap: 8,
  },
  subtitulo: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    color: COLORES.gris500,
  },

  // --- Código QR
  tarjetaQr: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORES.verde200,
    backgroundColor: COLORES.blanco,
    padding: 20,
    ...SOMBRAS.media,
  },
  espacioQr: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  textoVencido: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
    color: COLORES.gris600,
  },

  // --- Resumen del producto
  resumen: {
    alignItems: 'center',
    gap: 10,
  },
  nombreProducto: {
    textAlign: 'center',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: COLORES.gris900,
  },
  chipPuntos: {
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
  vence: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  venceTexto: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: COLORES.gris500,
  },
  venceUrgente: {
    color: COLORES.rojo600,
  },

  // --- Botones fijos abajo
  pie: {
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORES.verde100,
    backgroundColor: COLORES.blanco,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  // --- Sin producto seleccionado
  sinProducto: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: COLORES.blanco,
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
