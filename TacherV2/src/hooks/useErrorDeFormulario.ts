import { useState } from 'react'

export function useErrorDeFormulario() {
  const [error, setError] = useState('')

  const limpiarAlEditar = (setter: (valor: string) => void) => (texto: string) => {
    setError('')
    setter(texto)
  }

  return { error, setError, limpiarAlEditar }
}
