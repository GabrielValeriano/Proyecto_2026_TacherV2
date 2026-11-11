// Copia de TacherV2/src/components/CampoInput.tsx: si cambiás uno, cambiá el otro para que las dos apps se vean iguales.
import React, { type ReactNode } from 'react'
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native'
import { COLORES, RADIOS, SOMBRAS } from 'src/theme'

interface Props extends TextInputProps {
  label?: string
  icon?: ReactNode
  error?: boolean
}

export function CampoInput({ label, icon, error = false, ...inputProps }: Props) {
  return (
    <View style={estilos.contenedor}>
      {label && <Text style={estilos.etiqueta}>{label}</Text>}
      <View style={[estilos.caja, error && estilos.cajaConError]}>
        {icon}
        <TextInput
          placeholderTextColor={COLORES.gris}
          {...inputProps}
          style={[estilos.input, inputProps.style]}
        />
      </View>
    </View>
  )
}

const estilos = StyleSheet.create({
  contenedor: {
    gap: 6,
  },
  etiqueta: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: COLORES.verde800,
  },
  caja: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 52,
    borderRadius: RADIOS.medio,
    borderWidth: 1,
    borderColor: COLORES.verde200,
    backgroundColor: COLORES.blanco,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...SOMBRAS.chica,
  },
  cajaConError: {
    borderColor: COLORES.rojo500,
  },
  input: {
    flex: 1,
    padding: 0,
    fontSize: 15,
    color: COLORES.gris900,
  },
})
