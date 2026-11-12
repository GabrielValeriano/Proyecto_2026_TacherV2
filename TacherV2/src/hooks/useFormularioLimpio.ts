import { useEffect } from 'react'
import { useApp } from 'src/context/AppContext'
import { descartarCuentaIncompleta } from 'src/services/autenticacion'

/**
 * Para Login y Registro: cada vez que se entra a la pantalla se olvida todo lo del intento
 * anterior (email, DNI, nombre) y se descarta la cuenta a medias que hubiera quedado abierta.
 * Así los campos aparecen vacíos y sin relación con la cuenta previa.
 */
export function useFormularioLimpio() {
  const { reiniciarRegistro } = useApp()

  useEffect(() => {
    reiniciarRegistro()
    descartarCuentaIncompleta().catch((error) =>
      console.error('No se pudo descartar la cuenta anterior:', error),
    )
  }, [reiniciarRegistro])
}
