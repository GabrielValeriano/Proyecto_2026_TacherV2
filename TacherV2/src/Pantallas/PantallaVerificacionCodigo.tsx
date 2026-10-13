import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { MailCheck } from 'lucide-react-native'
import { BotonPrimario } from 'src/components/BotonPrimario'
import { MensajeError } from 'src/components/MensajeError'
import { ScreenHeader } from 'src/components/ScreenHeader'
import { TituloDePantalla } from 'src/components/TituloDePantalla'
import { useApp } from 'src/context/AppContext'
import { useVerificacionCorreo } from 'src/hooks/useVerificacionCorreo'
import { COLORES, SOMBRAS } from 'src/theme'

export function PantallaVerificacionCodigo() {
  const { navigate, flowData } = useApp()
  const { error, aviso, comprobando, esperaReenvio, reenviar, comprobarAhora } =
    useVerificacionCorreo(() => navigate('confirm-scan'))

  const puedeReenviar = esperaReenvio === 0

  return (
    <View style={estilos.pantalla}>
      <ScreenHeader title="Verificá tu correo" onBack={() => navigate('register-email')} />
      <View style={estilos.contenido}>
        <View style={estilos.formulario}>
          <View style={estilos.icono}>
            <MailCheck size={40} strokeWidth={1.75} color={COLORES.verde} />
          </View>

          <TituloDePantalla texto="Revisá tu correo" />

          <Text style={estilos.descripcion}>
            Te enviamos un link de verificación a{' '}
            <Text style={estilos.correoDestino}>{flowData.email}</Text>. Abrilo y volvé a la app:
            el siguiente paso se abre solo.
          </Text>

          <MensajeError message={error} />
          {aviso !== '' && error === '' && <Text style={estilos.aviso}>{aviso}</Text>}

          <BotonPrimario
            label="Ya verifiqué mi correo"
            onPress={comprobarAhora}
            loading={comprobando}
          />

          <TouchableOpacity
            activeOpacity={0.7}
            disabled={!puedeReenviar}
            onPress={reenviar}
            style={estilos.enlaceReenviar}
          >
            <Text style={estilos.textoReenviar}>
              ¿No te llegó?{' '}
              <Text style={puedeReenviar ? estilos.textoReenviarAccion : estilos.textoReenviarEspera}>
                {puedeReenviar ? 'Reenviar correo' : `Reenviar en ${esperaReenvio}s`}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
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
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  formulario: {
    gap: 16,
  },
  icono: {
    alignSelf: 'center',
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORES.verde200,
    backgroundColor: COLORES.verde100,
    ...SOMBRAS.chica,
  },
  descripcion: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22.75,
    color: COLORES.gris500,
  },
  correoDestino: {
    fontWeight: '600',
    color: COLORES.gris800,
  },
  aviso: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: COLORES.verde700,
  },
  enlaceReenviar: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  textoReenviar: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: COLORES.gris500,
  },
  textoReenviarAccion: {
    color: COLORES.verde600,
  },
  textoReenviarEspera: {
    color: COLORES.gris400,
  },
})
