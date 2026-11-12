import { useState } from 'react'
import { useApp } from 'src/context/AppContext'
import { descartarCuentaIncompleta } from 'src/services/autenticacion'

/**
 * "Volver" desde los pasos del registro posteriores a crear la cuenta en Auth.
 * Antes de volver descarta la cuenta a medias y borra los datos cargados, así el usuario
 * puede registrarse de nuevo (con el mismo mail u otro) sin el error de "ya registrado".
 */
export function useVolverAlRegistro() {
  const { navigate, reiniciarRegistro } = useApp()
  const [saliendo, setSaliendo] = useState(false)

  const volverAlRegistro = async () => {
    if (saliendo) return
    setSaliendo(true)
    try {
      await descartarCuentaIncompleta()
    } finally {
      // Se olvida el email, DNI y nombre cargados: el registro vuelve a empezar de cero
      reiniciarRegistro()
      navigate('register-email')
    }
  }

  return { volverAlRegistro, saliendo }
}
