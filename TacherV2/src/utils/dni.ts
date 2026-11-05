export function extraerDniDesdeCodigo(data: string): string {
  if (!data) return ''

  const limpio = data.trim()

  // Intentar dividir por separadores comunes en PDF417 argentino
  const tokens = limpio.split(/[@|\n\r\t;]/)

  for (const token of tokens) {
    const candidato = token.trim()
    // Buscar número de 7 u 8 dígitos
    if (/^\d{7,8}$/.test(candidato)) {
      return candidato
    }
  }

  // Fallback con regex global
  const match = limpio.match(/\b\d{7,8}\b/)
  if (match) {
    return match[0]
  }

  // Si no se logra extraer, devolvemos solo dígitos
  return limpio.replace(/\D/g, '').slice(0, 8)
}
