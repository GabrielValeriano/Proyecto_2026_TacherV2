export function formatearFecha(fecha: Date | string | null): string {
  if (!fecha) return '—'
  if (typeof fecha === 'string') return fecha

  return fecha.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** 292 -> "4:52" */
export function formatearTiempo(totalSegundos: number): string {
  const minutos = Math.floor(totalSegundos / 60)
  const segundos = totalSegundos % 60
  return `${minutos}:${String(segundos).padStart(2, '0')}`
}
