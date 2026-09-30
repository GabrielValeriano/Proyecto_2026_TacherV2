import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Gift, Home, Recycle, User } from 'lucide-react-native'
import { COLORES } from 'src/theme'

export type PestañaId = 'home' | 'ranking' | 'canjes' | 'perfil'

const PESTAÑAS = [
  { id: 'home', label: 'Inicio', icon: Home },
  { id: 'ranking', label: 'Ranking', icon: Recycle },
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
            style={estilos.pestaña}
          >
            <Icono size={22} color={activa ? COLORES.verde : COLORES.gris} />
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
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORES.blanco,
    borderTopWidth: 1,
    borderTopColor: COLORES.verde100,
    paddingVertical: 8,
    paddingHorizontal: 16,
    elevation: 5,
  },
  pestaña: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  etiqueta: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: COLORES.gris400,
  },
  etiquetaActiva: {
    color: COLORES.verde600,
  },
})
