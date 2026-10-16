import { useApp } from 'src/context/AppContext'
import type { PestañaId } from 'src/components/BarraDeNavegacion'

/** Qué hace cada pestaña de la barra de abajo. Lo usan todas las pantallas que muestran la barra. */
export function useNavegacionPestañas() {
  const { navigate, abrirEnDesarrollo } = useApp()

  return (id: PestañaId, label: string) => {
    if (id === 'home') return navigate('home')
    if (id === 'canjes') return navigate('canjes')
    if (id === 'ranking') return navigate('ranking')
    abrirEnDesarrollo(label) // Ranking y Perfil, por ahora en desarrollo
  }
}
