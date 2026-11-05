import { useCallback, useEffect, useState } from 'react'
import {
  obtenerHistorialCanjesPaginado,
  type CanjeHistorial,
  type ResultadoCanjesPaginado,
} from 'src/services/canjes'
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore'

interface Estado {
  items: CanjeHistorial[]
  cargandoInicial: boolean
  cargandoMas: boolean
  error: string
  hayMas: boolean
  refrescando: boolean
}

export function useHistorialCanjesPaginado(uid?: string, pageSize = 10) {
  const [estado, setEstado] = useState<Estado>({
    items: [],
    cargandoInicial: true,
    cargandoMas: false,
    error: '',
    hayMas: true,
    refrescando: false,
  })
  const [nextCursor, setNextCursor] = useState<QueryDocumentSnapshot<DocumentData> | null>(null)

  const cargarInicial = useCallback(async () => {
    if (!uid) {
      setEstado((prev) => ({ ...prev, items: [], cargandoInicial: false, error: '' }))
      setNextCursor(null)
      return
    }
    setEstado((prev) => ({ ...prev, cargandoInicial: true, error: '' }))
    try {
      const resultado: ResultadoCanjesPaginado = await obtenerHistorialCanjesPaginado(uid, pageSize, null)
      setEstado((prev) => ({
        ...prev,
        items: resultado.items,
        hayMas: resultado.hayMas,
        cargandoInicial: false,
        error: '',
      }))
      setNextCursor(resultado.nextCursor)
    } catch (error) {
      console.error('Error al cargar historial de canjes:', error)
      setEstado((prev) => ({
        ...prev,
        items: [],
        cargandoInicial: false,
        error: 'No se pudo cargar tu historial de canjes. Intentá de nuevo más tarde.',
      }))
      setNextCursor(null)
    }
  }, [uid, pageSize])

  const cargarMas = useCallback(async () => {
    if (!uid || estado.cargandoMas || !estado.hayMas || !nextCursor) return
    setEstado((prev) => ({ ...prev, cargandoMas: true }))
    try {
      const resultado: ResultadoCanjesPaginado = await obtenerHistorialCanjesPaginado(uid, pageSize, nextCursor)
      setEstado((prev) => ({
        ...prev,
        items: [...prev.items, ...resultado.items],
        hayMas: resultado.hayMas,
        cargandoMas: false,
      }))
      setNextCursor(resultado.nextCursor)
    } catch (error) {
      console.error('Error al cargar más canjes:', error)
      setEstado((prev) => ({ ...prev, cargandoMas: false }))
    }
  }, [uid, pageSize, estado.cargandoMas, estado.hayMas, nextCursor])

  const refrescar = useCallback(async () => {
    if (!uid) return
    setEstado((prev) => ({ ...prev, refrescando: true }))
    try {
      const resultado: ResultadoCanjesPaginado = await obtenerHistorialCanjesPaginado(uid, pageSize, null)
      setEstado((prev) => ({
        ...prev,
        items: resultado.items,
        hayMas: resultado.hayMas,
        refrescando: false,
        error: '',
      }))
      setNextCursor(resultado.nextCursor)
    } catch (error) {
      console.error('Error al refrescar historial de canjes:', error)
      setEstado((prev) => ({ ...prev, refrescando: false }))
    }
  }, [uid, pageSize])

  useEffect(() => {
    cargarInicial()
  }, [cargarInicial])

  return {
    canjes: estado.items,
    cargandoInicial: estado.cargandoInicial,
    cargandoMas: estado.cargandoMas,
    error: estado.error,
    hayMas: estado.hayMas,
    refrescando: estado.refrescando,
    cargarMas,
    refrescar,
  }
}
