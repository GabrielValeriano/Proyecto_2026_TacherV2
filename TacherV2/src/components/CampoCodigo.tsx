import React, { useRef, useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { COLORES, SOMBRAS } from 'src/theme'

interface Props {
  valor: string
  onCambiar: (valor: string) => void
  largo?: number
  error?: boolean
  autoFocus?: boolean
}

/**
 * Casillas para un código numérico. Debajo hay un único TextInput invisible: así funciona
 * pegar el código entero, borrar y el autocompletado del teclado.
 */
export function CampoCodigo({ valor, onCambiar, largo = 8, error = false, autoFocus = true }: Props) {
  const input = useRef<TextInput>(null)
  const [enfocado, setEnfocado] = useState(false)

  const cambiar = (texto: string) => onCambiar(texto.replace(/\D/g, '').slice(0, largo))

  return (
    <Pressable onPress={() => input.current?.focus()} accessibilityLabel={`Código de ${largo} dígitos`}>
      <View style={estilos.fila}>
        {Array.from({ length: largo }, (_, i) => {
          const actual = enfocado && i === Math.min(valor.length, largo - 1)
          return (
            <View
              key={i}
              style={[
                estilos.casilla,
                valor[i] !== undefined && estilos.casillaLlena,
                actual && estilos.casillaActual,
                error && estilos.casillaError,
              ]}
            >
              <Text style={estilos.digito}>{valor[i] ?? ''}</Text>
            </View>
          )
        })}
      </View>

      <TextInput
        ref={input}
        value={valor}
        onChangeText={cambiar}
        onFocus={() => setEnfocado(true)}
        onBlur={() => setEnfocado(false)}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={largo}
        autoFocus={autoFocus}
        caretHidden
        style={estilos.inputOculto}
      />
    </Pressable>
  )
}

const estilos = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  casilla: {
    flex: 1,
    aspectRatio: 0.8,
    maxWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORES.verde200,
    backgroundColor: COLORES.blanco,
    ...SOMBRAS.chica,
  },
  casillaLlena: {
    borderColor: COLORES.principal,
    backgroundColor: COLORES.suave,
  },
  casillaActual: {
    borderWidth: 2,
    borderColor: COLORES.principal,
  },
  casillaError: {
    borderColor: COLORES.rojo500,
    backgroundColor: COLORES.rojo50,
  },
  digito: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    color: COLORES.oscuro,
  },
  inputOculto: {
    ...StyleSheet.absoluteFill,
    opacity: 0.01,
    color: 'transparent',
  },
})
