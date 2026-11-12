import React, { useState, type ReactNode } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View, type TextInputProps } from 'react-native'
import { Eye, EyeOff } from 'lucide-react-native'
import { COLORES, RADIOS, SOMBRAS } from 'src/theme'

interface Props extends TextInputProps {
  label?: string
  icon?: ReactNode
  error?: boolean
}

/**
 * Campo de texto de la app. Si es de contraseña (`secureTextEntry`), muestra a la derecha un
 * botón con un ojo para ver u ocultar lo que se escribe.
 */
export function CampoInput({ label, icon, error = false, secureTextEntry, ...inputProps }: Props) {
  const esContrasena = Boolean(secureTextEntry)
  const [visible, setVisible] = useState(false)
  const IconoOjo = visible ? EyeOff : Eye

  return (
    <View style={estilos.contenedor}>
      {label && <Text style={estilos.etiqueta}>{label}</Text>}
      <View style={[estilos.caja, error && estilos.cajaConError]}>
        {icon}
        <TextInput
          placeholderTextColor={COLORES.gris}
          autoCapitalize={esContrasena ? 'none' : undefined}
          autoCorrect={esContrasena ? false : undefined}
          {...inputProps}
          secureTextEntry={esContrasena && !visible}
          style={[estilos.input, inputProps.style]}
        />
        {esContrasena && (
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => setVisible((v) => !v)}
            hitSlop={10}
            style={estilos.botonOjo}
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            <IconoOjo size={20} color={COLORES.textoSuave} />
          </TouchableOpacity>
        )}
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
  botonOjo: {
    marginLeft: 4,
    padding: 2,
  },
  input: {
    flex: 1,
    padding: 0,
    fontSize: 15,
    color: COLORES.gris900,
  },
})
