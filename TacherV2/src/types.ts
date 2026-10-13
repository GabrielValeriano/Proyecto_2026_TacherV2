export type Pantalla =
  | 'welcome'
  | 'register-email'
  | 'register-username'
  | 'login-email'
  | 'login-code'
  | 'confirm-scan'
  | 'home'
  | 'recibo-canje'
  | 'en-desarrollo'
  | 'canjes'
  | 'seleccionar-producto'
  | 'generar-qr'

export type ProveedorAuth = 'email' | 'google.com'

export interface Usuario {
  id: string
  Nombre: string
  Email: string
  DNI: string
  Proveedor: ProveedorAuth
  FechaRegistro: string
  Puntos: number
  Rango: string
}

/** Datos que se van acumulando a lo largo del flujo de registro. */
export interface FlowData {
  email?: string
  nombre?: string
  dni?: string
  proveedor?: ProveedorAuth
}

export interface AppContextValue {
  pantallaActual: Pantalla
  seccionEnDesarrollo: string
  userData: Usuario | null
  flowData: FlowData
  navigate: (pantalla: Pantalla) => void
  abrirEnDesarrollo: (seccion: string) => void
  actualizarFlowData: (parcial: FlowData) => void
  setUserDocId: (id: string | null) => void
  cerrarSesion: () => void
  productoSeleccionado: Producto | null
  seleccionarProducto: (producto: Producto) => void
}

export interface Canje {
  id: string
  producto: string
  puntosCanjeados: number
  codigo: string
  /** Date si Firestore la guarda como fecha; string si viene como texto no parseable. */
  fecha: Date | string | null
}

export interface Producto {
  id: string
  nombre: string
  puntos: number
  imagen: string | null
  disponible: boolean
  descripcion: string
  categoria: string
}

export type ValidacionCanje = 'pendiente' | 'finalizado' | 'cancelado'

export interface CanjePendiente {
  id: string
  vence: Date
}