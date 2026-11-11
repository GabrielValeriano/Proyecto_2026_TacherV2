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
  | 'historial-reciclajes'
  | 'ranking'
  | 'perfil'
  | 'datos-condiciones'
  | 'cambiar-dni'
  | 'ajustes'
  | 'historial-canjes'
  | 'notificaciones'
  | 'recuperar-email'
  | 'recuperar-codigo'
  | 'recuperar-contrasena'
  | 'instrucciones'
  | 'informacion'

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
  /** Cantidad de reciclajes: la suma la caja (ServerNuevo.js). De acá sale el rango. */
  reciclajes?: number
}

/** Datos que se van acumulando a lo largo del flujo de registro. */
export interface FlowData {
  email?: string
  nombre?: string
  dni?: string
  proveedor?: ProveedorAuth
  /** Recuperación de contraseña: lo da el backend al verificar el código de 8 dígitos. */
  tokenRecuperacion?: string
}

export interface AppContextValue {
  pantallaActual: Pantalla
  /** La pantalla desde la que se llegó a la actual (para los "volver" que dependen del origen). */
  pantallaAnterior: Pantalla | null
  seccionEnDesarrollo: string
  userData: Usuario | null
  flowData: FlowData
  navigate: (pantalla: Pantalla) => void
  abrirEnDesarrollo: (seccion: string) => void
  actualizarFlowData: (parcial: FlowData) => void
  setUserDocId: (id: string | null) => void
  cerrarSesion: () => void
  productoSeleccionado: Producto | null
  seleccionarProducto: (producto: Producto | null) => void
  mensajeExito?: string
  mostrarExito?: (mensaje: string, duracionMs?: number) => void
  ocultarExito?: () => void
  /** Notificaciones del usuario logueado, de la más nueva a la más vieja (en tiempo real). */
  notificaciones: Notificacion[]
  cargandoNotificaciones: boolean
  errorNotificaciones: string
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

export type TipoNotificacion = 'reciclaje' | 'canje' | 'general'

/** USUARIOS/{uid}/NOTIFICACIONES/{id}. Las crean la caja (reciclajes) y el cajero (canjes). */
export interface Notificacion {
  id: string
  tipo: TipoNotificacion
  titulo: string
  mensaje: string
  fecha: Date | null
  leida: boolean
}
