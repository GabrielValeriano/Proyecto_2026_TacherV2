import React, { useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { MailCheck } from 'lucide-react-native'
import { BotonPrimario } from 'src/components/BotonPrimario'
import { CampoCodigo } from 'src/components/CampoCodigo'
import { MensajeError } from 'src/components/MensajeError'
import { ScreenHeader } from 'src/components/ScreenHeader'
import { TituloDePantalla } from 'src/components/TituloDePantalla'
import { useApp } from 'src/context/AppContext'
import { useSegundosRestantes } from 'src/hooks/useSegundosRestantes'
import { solicitarCodigoRecuperacion, verificarCodigoRecuperacion } from 'src/services/recuperacion'
import { COLORES, SOMBRAS } from 'src/theme'

const LARGO_CODIGO = 8
const ESPERA_REENVIO_MS = 60 * 1000

/** Recuperación, paso 2 de 3: el usuario ingresa el código de 8 dígitos que le llegó por mail. */
export function PantallaRecuperarCodigo() {
  const { navigate, flowData, actualizarFlowData } = useApp()
  const email = flowData.email ?? ''

  const [codigo, setCodigo] = useState('')
  const [verificando, setVerificando] = useState(false)
  const [reenviando, setReenviando] = useState(false)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  // El código se pidió al salir de la pantalla anterior: arrancamos la espera para reenviar
  const [puedeReenviarEn, setPuedeReenviarEn] = useState(() => new Date(Date.now() + ESPERA_REENVIO_MS))
  const esperaReenvio = useSegundosRestantes(puedeReenviarEn)

  const completo = codigo.length === LARGO_CODIGO

  const handleCambiarCodigo = (valor: string) => {
    setCodigo(valor)
    if (error) setError('')
  }

  const handleVerificar = async () => {
    if (!completo) return setError(`Ingresá los ${LARGO_CODIGO} dígitos del código.`)
    setError('')
    setAviso('')
    setVerificando(true)
    const resultado = await verificarCodigoRecuperacion(email, codigo)
    setVerificando(false)

    if (!resultado.ok) return setError(resultado.mensaje)
    actualizarFlowData({ tokenRecuperacion: resultado.token })
    navigate('recuperar-contrasena')
  }

  const handleReenviar = async () => {
    setError('')
    setAviso('')
    setReenviando(true)
    const resultado = await solicitarCodigoRecuperacion(email)
    setReenviando(false)

    if (!resultado.ok) return setError(resultado.mensaje)
    setCodigo('')
    setAviso('Te enviamos un código nuevo. El anterior ya no sirve.')
    setPuedeReenviarEn(new Date(Date.now() + ESPERA_REENVIO_MS))
  }

  const puedeReenviar = esperaReenvio === 0 && !reenviando

  return (
    <View style={estilos.pantalla}>
      <ScreenHeader title="Código de verificación" onBack={() => navigate('recuperar-email')} />
      <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
        <View style={estilos.formulario}>
          <View style={estilos.icono}>
            <MailCheck size={40} strokeWidth={1.75} color={COLORES.verde} />
          </View>

          <TituloDePantalla texto="Revisá tu correo" />

          <Text style={estilos.descripcion}>
            Te enviamos un código de {LARGO_CODIGO} dígitos a{' '}
            <Text style={estilos.correoDestino}>{email}</Text>. Vence en 10 minutos.
          </Text>

          <CampoCodigo
            valor={codigo}
            onCambiar={handleCambiarCodigo}
            largo={LARGO_CODIGO}
            error={error !== ''}
          />

          <MensajeError message={error} />
          {aviso !== '' && error === '' && <Text style={estilos.aviso}>{aviso}</Text>}

          <BotonPrimario
            label="Verificar"
            onPress={handleVerificar}
            loading={verificando}
            disabled={!completo}
          />

          <TouchableOpacity
            activeOpacity={0.7}
            disabled={!puedeReenviar}
            onPress={handleReenviar}
            style={estilos.enlaceReenviar}
          >
            <Text style={estilos.textoReenviar}>
              ¿No te llegó?{' '}
              <Text style={puedeReenviar ? estilos.textoReenviarAccion : estilos.textoReenviarEspera}>
                {reenviando
                  ? 'Enviando…'
                  : esperaReenvio > 0
                    ? `Reenviar en ${esperaReenvio}s`
                    : 'Reenviar código'}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: COLORES.blanco,
  },
  contenido: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
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
