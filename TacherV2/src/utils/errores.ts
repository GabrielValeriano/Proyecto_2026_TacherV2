export function mensajeDeError(error: unknown, mensajePorDefecto: string): string {
  return error instanceof Error && error.message ? error.message : mensajePorDefecto
}
