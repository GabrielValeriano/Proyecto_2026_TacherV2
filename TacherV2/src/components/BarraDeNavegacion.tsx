import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Gift, Home, Trophy, User } from 'lucide-react-native'
import { COLORES, RADIOS, SOMBRAS } from 'src/theme'

export type PestañaId = 'home' | 'ranking' | 'canjes' | 'perfil'

const PESTAÑAS = [
  { id: 'home', label: 'Inicio', icon: Home },
  { id: 'ranking', label: 'Ranking', icon: Trophy },
  { id: 'canjes', label: 'Canjes', icon: Gift },
  { id: 'perfil', label: 'Perfil', icon: User },
] as const

interface Props {
  activeTab: PestañaId
  onTabPress: (id: PestañaId, label: string) => void
}

export function BarraDeNavegacion({ activeTab, onTabPress }: Props) {
  return (
    <View style={estilos.contenedor}>
      {PESTAÑAS.map(({ id, label, icon: Icono }) => {
        const activa = activeTab === id
        return (
          <TouchableOpacity
            key={id}
            activeOpacity={0.7}
            onPress={() => onTabPress(id, label)}
            style={[estilos.pestaña, activa && estilos.pestañaActiva]}
            accessibilityRole="tab"
            accessibilityState={{ selected: activa }}
            accessibilityLabel={label}
          >
            <Icono
              size={22}
              strokeWidth={activa ? 2.4 : 2}
              color={activa ? COLORES.principal : COLORES.textoSuave}
            />
            <Text style={[estilos.etiqueta, activa && estilos.etiquetaActiva]}>{label}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const estilos = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    gap: 4,
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 14,
    borderRadius: RADIOS.grande,
    borderWidth: 1,
    borderColor: COLORES.linea,
    backgroundColor: COLORES.blanco,
    padding: 6,
    ...SOMBRAS.marca,
  },
  pestaña: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    borderRadius: RADIOS.tarjeta - 2,
    paddingVertical: 10,
  },
  // Pastilla apenas verde: marca la pestaña sin competir con el contenido
  pestañaActiva: {
    backgroundColor: 'rgba(38,130,87,0.09)',
  },
  etiqueta: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500',
    color: COLORES.textoSuave,
  },
  etiquetaActiva: {
    fontWeight: '700',
    color: COLORES.principalOscuro,
  },
})
