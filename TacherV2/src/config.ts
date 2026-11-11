export const GOOGLE_WEB_CLIENT_ID =
  '19002843378-jkcv53u77nfqvpm21ulf1p4irqajpdp3.apps.googleusercontent.com'

export const EMAILJS = {
  url: 'https://api.emailjs.com/api/v1.0/email/send',
  serviceId: 'service_zbwfi2e',
  templateId: 'template_nsfs7b1',
  publicKey: 'qPBhMhwXdDurztFHm',
} as const

/**
 * Backend (Backend-TacherV2/ServerNuevo.js). El teléfono tiene que poder llegar a esta dirección:
 * misma red Wi-Fi que la PC del servidor, o la URL pública si se publica en internet.
 */
export const BACKEND_URL = 'http://10.56.16.12:5000'
