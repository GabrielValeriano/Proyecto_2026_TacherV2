import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Gift, Home, Trophy, User } from 'lucide-react-native'
import { COLORES, SOMBRAS } from 'src/theme'

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
          >
            <Icono size={24} color={activa ? COLORES.oscuro : COLORES.textoSuave} />
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
    borderRadius: 26,
    borderWidth: 1,
    borderColor: COLORES.linea,
    backgroundColor: COLORES.blanco,
    padding: 6,
    ...SOMBRAS.chica,
  },
  pestaña: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    borderRadius: 20,
    paddingVertical: 10,
  },
  pestañaActiva: {
    backgroundColor: COLORES.suave,
  },
  etiqueta: {
    fontSize: 13,
    lineHeight: 16,
    color: COLORES.textoSuave,
  },
  etiquetaActiva: {
    fontWeight: '600',
    color: COLORES.oscuro,
  },
})
