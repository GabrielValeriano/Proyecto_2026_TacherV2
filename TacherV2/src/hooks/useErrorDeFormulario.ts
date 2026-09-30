import { useState } from 'react'

/** Estado de error de un formulario, con helper para limpiarlo cuando el usuario edita un campo. */
export function useErrorDeFormulario() {
  const [error, setError] = useState('')

  const limpiarAlEditar = (setter: (valor: string) => void) => (texto: string) => {
    setError('')
    setter(texto)
  }

  return { error, setError, limpiarAlEditar }
}
