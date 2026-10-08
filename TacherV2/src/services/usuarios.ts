import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from 'src/firebase'
import { RANGOS } from 'src/domain/rangos'
import type { FlowData, Usuario } from 'src/types'

const COLECCION_USUARIOS = 'USUARIOS'

const perfilRef = (uid: string) => doc(db, COLECCION_USUARIOS, uid)

function aUsuario(docSnap: { id: string; data: () => DocumentData | undefined }): Usuario {
  return { id: docSnap.id, ...docSnap.data() } as Usuario
}

export async function existePerfil(uid: string): Promise<boolean> {
  return (await getDoc(perfilRef(uid))).exists()
}

export async function registrarPerfil(
  uid: string,
  nombre: string,
  datos: FlowData,
): Promise<void> {
  const perfil: Omit<Usuario, 'id'> = {
    Nombre: nombre,
    Email: datos.email ?? '',
    DNI: datos.dni ?? 'N/A',
    Proveedor: datos.proveedor ?? 'email',
    FechaRegistro: new Date().toISOString(),
    Puntos: 0,
    Rango: RANGOS[0].name,
  }
  await setDoc(perfilRef(uid), perfil)
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
