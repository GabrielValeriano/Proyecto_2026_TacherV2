import { EMAILJS } from 'src/config'

export function generarCodigoVerificacion(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function enviarCodigoVerificacion(emailDestino: string, codigo: string) {
  let response: Response
  try {
    response = await fetch(EMAILJS.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'http://localhost' },
      body: JSON.stringify({
        service_id: EMAILJS.serviceId,
        template_id: EMAILJS.templateId,
        user_id: EMAILJS.publicKey,
        template_params: { to_email: emailDestino, code: codigo },
      }),
    })
  } catch (error) {
    console.error('Error de red enviando mail:', error)
    throw new Error('Error de conexión al enviar el correo.')
  }

  if (!response.ok) {
    console.error('Error enviando mail con EmailJS:', response.status, await response.text())
    throw new Error('No se pudo enviar el correo de verificación.')
  }
}
