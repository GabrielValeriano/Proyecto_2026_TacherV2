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

/** "Recién", "Hace 5 min", "Hace 3 h", "Ayer" o la fecha corta (10/11/2026). */
export function formatearHaceCuanto(fecha: Date | null, ahora = Date.now()): string {
  if (!fecha) return ''
  const minutos = Math.floor((ahora - fecha.getTime()) / 60000)
  if (minutos < 1) return 'Recién'
  if (minutos < 60) return `Hace ${minutos} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `Hace ${horas} h`
  if (horas < 48) return 'Ayer'
  return fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
