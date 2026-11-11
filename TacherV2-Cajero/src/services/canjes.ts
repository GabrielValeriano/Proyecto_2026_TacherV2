import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore'
import { db } from 'src/firebase'
import { enviarPush } from 'src/services/push'

export type ResultadoCanje =
  | { ok: true; producto: string; cliente: string; puntos: number }
  | { ok: false; mensaje: string }

/** Los ids que genera Firestore son 20 letras y números. Cualquier otro QR no es un canje. */
const ID_DE_CANJE = /^[A-Za-z0-9]{20}$/

function aFecha(valor: unknown): Date | null {
  const conToDate = valor as { toDate?: () => Date } | null
  return conToDate && typeof conToDate.toDate === 'function' ? conToDate.toDate() : null
}

function mensajeDeFirestore(error: unknown): string {
  const codigo = (error as { code?: string }).code
  if (codigo === 'permission-denied') {
    return 'El servidor rechazó el canje. Puede que el QR haya vencido o que tu cuenta no sea de cajero.'
  }
  if (codigo === 'unavailable' || codigo === 'network-request-failed') {
    return 'Sin conexión. Revisá tu internet e intentá de nuevo.'
  }
  console.error('Error al finalizar el canje:', error)
  return 'No se pudo completar el canje. Intentá de nuevo.'
}

/**
 * Valida el QR y, si todo está bien, en UNA sola transacción:
 *  - pasa el canje de pendiente a finalizado
 *  - le descuenta al cliente los puntos del producto
 * Si dos cajeros escanean el mismo QR a la vez, solo uno lo consigue.
 */
/** Lo que devuelve la transacción: el resultado más los datos para avisarle al cliente. */
type ResultadoInterno =
  | { ok: false; mensaje: string }
  | {
      ok: true
      resultado: Extract<ResultadoCanje, { ok: true }>
      tokensCliente: string[]
      aviso: { titulo: string; mensaje: string }
    }

export async function finalizarCanje(codigo: string): Promise<ResultadoCanje> {
  const id = codigo.trim()
  if (!ID_DE_CANJE.test(id)) {
    return { ok: false, mensaje: 'Este QR no es un canje de TacherV2.' }
  }

  let interno: ResultadoInterno
  try {
    interno = await runTransaction(db, async (transaccion): Promise<ResultadoInterno> => {
      const canjeRef = doc(db, 'CANJES', id)
      const canjeSnap = await transaccion.get(canjeRef)
      if (!canjeSnap.exists()) {
        return { ok: false, mensaje: 'Este QR no corresponde a ningún canje.' }
      }
      const canje = canjeSnap.data()

      if (canje.Validacion === 'finalizado') {
        return { ok: false, mensaje: 'Este canje ya fue finalizado. El QR no se puede usar de nuevo.' }
      }
      if (canje.Validacion === 'cancelado') {
        return { ok: false, mensaje: 'El cliente canceló este canje.' }
      }
      if (canje.Validacion !== 'pendiente') {
        return { ok: false, mensaje: 'Este canje no es válido.' }
      }

      const vence = aFecha(canje.Vence)
      if (!vence || vence.getTime() <= Date.now()) {
        return { ok: false, mensaje: 'Este QR venció. Pedile al cliente que genere uno nuevo.' }
      }

      const puntosDelCanje = Number(canje.PuntosCanjeados) || 0
      if (puntosDelCanje <= 0 || typeof canje.Uid !== 'string') {
        return { ok: false, mensaje: 'Este canje no es válido.' }
      }

      const clienteRef = doc(db, 'USUARIOS', canje.Uid)
      const clienteSnap = await transaccion.get(clienteRef)
      if (!clienteSnap.exists()) {
        return { ok: false, mensaje: 'No se encontró la cuenta del cliente.' }
      }

      const cliente = clienteSnap.data()
      const puntosDelCliente = Number(cliente.Puntos) || 0
      if (puntosDelCliente < puntosDelCanje) {
        return { ok: false, mensaje: 'Al cliente no le alcanzan los puntos para este canje.' }
      }

      transaccion.update(canjeRef, {
        Validacion: 'finalizado',
        FechaFinalizado: serverTimestamp(),
      })
      transaccion.update(clienteRef, {
        Puntos: puntosDelCliente - puntosDelCanje,
        UltimoCanje: id,
      })

      // La notificación se guarda en la misma transacción: si el canje no se confirma, no hay aviso
      const producto = String(canje.Producto ?? 'Producto')
      const aviso = {
        titulo: 'Canje confirmado',
        mensaje: `Retiraste ${producto} por ${puntosDelCanje} puntos. ¡Gracias por reciclar!`,
      }
      transaccion.set(doc(collection(clienteRef, 'NOTIFICACIONES')), {
        Tipo: 'canje',
        Titulo: aviso.titulo,
        Mensaje: aviso.mensaje,
        Fecha: serverTimestamp(),
        Leida: false,
      })

      return {
        ok: true,
        resultado: {
          ok: true,
          producto,
          cliente: String(canje.Usuario ?? 'Cliente'),
          puntos: puntosDelCanje,
        },
        tokensCliente: Array.isArray(cliente.ExpoPushTokens) ? cliente.ExpoPushTokens : [],
        aviso,
      }
    })
  } catch (error) {
    return { ok: false, mensaje: mensajeDeFirestore(error) }
  }

  if (!interno.ok) return interno
  // Sin await: el cajero ve el resultado al instante, el push sale en segundo plano
  enviarPush(interno.tokensCliente, interno.aviso)
  return interno.resultado
}
