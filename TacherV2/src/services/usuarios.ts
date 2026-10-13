import {
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  updateDoc,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from 'src/firebase'
import { RANGOS } from 'src/domain/rangos'
import type { FlowData, Usuario } from 'src/types'

const COLECCION_USUARIOS = 'USUARIOS'

/** Un documento por nombre ya tomado: sirve para garantizar que no se repitan. */
const COLECCION_NOMBRES = 'NOMBRES_USUARIO'
const NOMBRE_EN_USO = 'nombre-en-uso'

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
 * Crea el perfil con los datos acumulados en el registro y reserva el nombre de usuario,
 * todo junto: si el nombre ya lo tiene otra persona, no se crea nada.
 * La contraseña vive solo en Auth.
 */
export async function registrarPerfil(
  uid: string,
  nombre: string,
  datos: FlowData,
): Promise<ResultadoRegistro> {
  const perfil: Omit<Usuario, 'id'> = {
    Nombre: nombre,
    Email: datos.email ?? '',
    DNI: datos.dni ?? 'N/A',
    Proveedor: datos.proveedor ?? 'email',
    FechaRegistro: new Date().toISOString(),
    Puntos: 0,
    Rango: RANGOS[0].name,
  }
  const clave = claveDeNombre(nombre)
  if (!claveEsValida(clave)) {
    return { ok: false, mensaje: 'Ese nombre de usuario no es válido. Probá con otro.' }
  }
  const nombreRef = doc(db, COLECCION_NOMBRES, clave)

  try {
    await runTransaction(db, async (transaccion) => {
      const nombreSnap = await transaccion.get(nombreRef)

      if (nombreSnap.exists()) {
        if (nombreSnap.data()?.Uid !== uid) throw new Error(NOMBRE_EN_USO)
      } else {
        transaccion.set(nombreRef, { Uid: uid })
      }
      transaccion.set(perfilRef(uid), perfil)
    })
    return { ok: true }
  } catch (error) {
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

export function actualizarRango(uid: string, rango: string): Promise<void> {
  return updateDoc(perfilRef(uid), { Rango: rango })
}
