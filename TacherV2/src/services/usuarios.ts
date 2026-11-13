import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  runTransaction,
  updateDoc,
  where,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from 'src/firebase'
import { validarNombreUsuario } from 'src/domain/nombreUsuario'
import { NIVELES } from 'src/domain/niveles'
import type { FlowData, Usuario } from 'src/types'

const COLECCION_USUARIOS = 'USUARIOS'

/** Un documento por nombre ya tomado: sirve para garantizar que no se repitan. */
const COLECCION_NOMBRES = 'NOMBRES_USUARIO'
const NOMBRE_EN_USO = 'nombre-en-uso'

/** Igual que los nombres: un documento por DNI ya vinculado, con el uid de su dueño. */
const COLECCION_DNIS = 'DNIS'
const DNI_EN_USO = 'dni-en-uso'
export const MENSAJE_DNI_EN_USO = 'Este DNI ya se encuentra registrado'

/** "01.234.567" -> "1234567": solo dígitos y sin ceros adelante, para que no se cuele un duplicado. */
export function claveDeDni(dni: string): string {
  return dni.replace(/\D/g, '').replace(/^0+/, '')
}

const dniRef = (clave: string) => doc(db, COLECCION_DNIS, clave)

/**
 * ¿Hay OTRA cuenta con este DNI? Mira la reserva en DNIS y, por las dudas, también el campo
 * DNI de USUARIOS (cuentas creadas antes de que existieran las reservas).
 */
export async function dniEnUsoPorOtro(dni: string, uid: string): Promise<boolean> {
  const clave = claveDeDni(dni)
  if (!clave) return false

  const reserva = await getDoc(dniRef(clave))
  if (reserva.exists() && reserva.data()?.Uid !== uid) return true

  const variantes = Array.from(new Set([dni.trim(), clave]))
  const perfiles = await getDocs(
    query(collection(db, COLECCION_USUARIOS), where('DNI', 'in', variantes), limit(5)),
  )
  return perfiles.docs.some((perfil) => perfil.id !== uid)
}

/** "  Juan   Pérez " -> "juan pérez", codificado para usarlo como id de documento. */
function claveDeNombre(nombre: string): string {
  return encodeURIComponent(nombre.trim().replace(/\s+/g, ' ').toLowerCase())
}

/** Firestore no admite ids como "." o "..", ni que empiecen con "__". */
function claveEsValida(clave: string): boolean {
  return clave !== '' && clave !== '.' && clave !== '..' && !clave.startsWith('__') && clave.length <= 200
}

/** El id del documento es el uid que asigna Firebase Auth. */
const perfilRef = (uid: string) => doc(db, COLECCION_USUARIOS, uid)

function aUsuario(docSnap: { id: string; data: () => DocumentData | undefined }): Usuario {
  return { id: docSnap.id, ...docSnap.data() } as Usuario
}

export async function existePerfil(uid: string): Promise<boolean> {
  return (await getDoc(perfilRef(uid))).exists()
}

export type ResultadoRegistro = { ok: true } | { ok: false; mensaje: string }

/**
 * Crea el perfil con los datos acumulados en el registro y reserva el nombre de usuario y el DNI,
 * todo junto: si el nombre o el DNI ya los tiene otra persona, no se crea nada.
 * La contraseña vive solo en Auth.
 */
export async function registrarPerfil(
  uid: string,
  nombre: string,
  datos: FlowData,
): Promise<ResultadoRegistro> {
  const errorDeNombre = validarNombreUsuario(nombre)
  if (errorDeNombre) return { ok: false, mensaje: errorDeNombre }

  const perfil: Omit<Usuario, 'id'> & { reciclajes: number } = {
    Nombre: nombre,
    Email: datos.email ?? '',
    DNI: datos.dni ?? '',
    Proveedor: datos.proveedor ?? 'email',
    FechaRegistro: new Date().toISOString(),
    Puntos: 0,
    Rango: NIVELES[0].name,
    reciclajes: 0,
  }
  const clave = claveDeNombre(nombre)
  if (!claveEsValida(clave)) {
    return { ok: false, mensaje: 'Ese nombre de usuario no es válido. Probá con otro.' }
  }
  const nombreRef = doc(db, COLECCION_NOMBRES, clave)

  const claveDni = claveDeDni(datos.dni ?? '')
  if (!claveDni) {
    return { ok: false, mensaje: 'Falta escanear tu DNI. Volvé al paso anterior.' }
  }
  // Las cuentas viejas no tienen reserva en DNIS: esas se detectan por el campo DNI
  if (await dniEnUsoPorOtro(datos.dni ?? '', uid)) {
    return { ok: false, mensaje: MENSAJE_DNI_EN_USO }
  }
  const reservaDniRef = dniRef(claveDni)

  try {
    await runTransaction(db, async (transaccion) => {
      const [nombreSnap, dniSnap] = await Promise.all([
        transaccion.get(nombreRef),
        transaccion.get(reservaDniRef),
      ])

      // La reserva del DNI dentro de la transacción evita que dos registros a la vez se lo queden
      if (dniSnap.exists() && dniSnap.data()?.Uid !== uid) throw new Error(DNI_EN_USO)
      if (nombreSnap.exists() && nombreSnap.data()?.Uid !== uid) throw new Error(NOMBRE_EN_USO)

      if (!nombreSnap.exists()) transaccion.set(nombreRef, { Uid: uid })
      if (!dniSnap.exists()) transaccion.set(reservaDniRef, { Uid: uid })
      transaccion.set(perfilRef(uid), perfil)
    })
    return { ok: true }
  } catch (error) {
    if (error instanceof Error && error.message === DNI_EN_USO) {
      return { ok: false, mensaje: MENSAJE_DNI_EN_USO }
    }
    if (error instanceof Error && error.message === NOMBRE_EN_USO) {
      return { ok: false, mensaje: 'Este nombre de usuario ya está registrado. Elegí otro.' }
    }
    throw error
  }
}

export function escucharUsuario(
  uid: string,
  onChange: (usuario: Usuario) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    perfilRef(uid),
    (snap) => {
      if (snap.exists()) onChange(aUsuario(snap))
    },
    onError,
  )
}

export function actualizarNivel(uid: string, nivel: string): Promise<void> {
  return updateDoc(perfilRef(uid), { Rango: nivel })
}

/**
 * Cambia el DNI de la cuenta: reserva el nuevo y libera el anterior en la misma transacción.
 * Si el nuevo DNI ya lo tiene otra cuenta, no cambia nada.
 */
export async function actualizarDni(
  uid: string,
  dniActual: string,
  dniNuevo: string,
): Promise<{ ok: true } | { ok: false; mensaje: string }> {
  const claveNueva = claveDeDni(dniNuevo)
  const claveActual = claveDeDni(dniActual)
  if (!claveNueva) return { ok: false, mensaje: 'No pudimos leer el DNI. Intentá escanearlo nuevamente.' }

  try {
    if (await dniEnUsoPorOtro(dniNuevo, uid)) return { ok: false, mensaje: MENSAJE_DNI_EN_USO }

    await runTransaction(db, async (transaccion) => {
      const refNueva = dniRef(claveNueva)
      const refActual = claveActual && claveActual !== claveNueva ? dniRef(claveActual) : null
      const [snapNueva, snapActual] = await Promise.all([
        transaccion.get(refNueva),
        refActual ? transaccion.get(refActual) : Promise.resolve(null),
      ])

      if (snapNueva.exists() && snapNueva.data()?.Uid !== uid) throw new Error(DNI_EN_USO)

      // Solo se libera la reserva vieja si era de esta cuenta
      if (refActual && snapActual?.exists() && snapActual.data()?.Uid === uid) {
        transaccion.delete(refActual)
      }
      if (!snapNueva.exists()) transaccion.set(refNueva, { Uid: uid })
      transaccion.update(perfilRef(uid), { DNI: dniNuevo })
    })
    return { ok: true }
  } catch (error) {
    if (error instanceof Error && error.message === DNI_EN_USO) {
      return { ok: false, mensaje: MENSAJE_DNI_EN_USO }
    }
    console.error('Error al actualizar el DNI:', error)
    return { ok: false, mensaje: 'No se pudo actualizar el DNI. Intentá de nuevo.' }
  }
}

export function actualizarNombre(uid: string, nombre: string): Promise<void> {
  return updateDoc(perfilRef(uid), { Nombre: nombre })
}

export async function actualizarNombreUsuario(
  uid: string,
  nombreActual: string,
  nombreNuevo: string,
): Promise<{ ok: true } | { ok: false; mensaje: string }> {
  const errorDeNombre = validarNombreUsuario(nombreNuevo)
  if (errorDeNombre) return { ok: false, mensaje: errorDeNombre }

  const claveActual = claveDeNombre(nombreActual)
  const claveNueva = claveDeNombre(nombreNuevo)

  if (!claveEsValida(claveNueva)) {
    return { ok: false, mensaje: 'Ese nombre de usuario no es válido. Probá con otro.' }
  }

  const nombreRefActual = doc(db, COLECCION_NOMBRES, claveActual)
  const nombreRefNuevo = doc(db, COLECCION_NOMBRES, claveNueva)

  try {
    await runTransaction(db, async (transaccion) => {
      const [snapActual, snapNuevo] = await Promise.all([
        transaccion.get(nombreRefActual),
        transaccion.get(nombreRefNuevo),
      ])

      if (snapNuevo.exists()) {
        const uidGuardado = snapNuevo.data()?.Uid
        if (uidGuardado && uidGuardado !== uid) throw new Error(NOMBRE_EN_USO)
      }

      if (claveActual !== claveNueva) {
        if (snapActual.exists()) {
          transaccion.delete(nombreRefActual)
        }
        transaccion.set(nombreRefNuevo, { Uid: uid })
      } else if (!snapNuevo.exists()) {
        transaccion.set(nombreRefNuevo, { Uid: uid })
      }

      transaccion.update(perfilRef(uid), { Nombre: nombreNuevo })
    })
    return { ok: true }
  } catch (error) {
    if (error instanceof Error && error.message === NOMBRE_EN_USO) {
      return { ok: false, mensaje: 'Este nombre de usuario ya está registrado. Elegí otro.' }
    }
    console.error('Error al actualizar el nombre de usuario:', error)
    return { ok: false, mensaje: 'No se pudo actualizar el nombre. Intentá de nuevo.' }
  }
}
