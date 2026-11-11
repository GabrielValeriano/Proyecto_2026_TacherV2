import React, { type ReactNode } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import {
  AlertTriangle,
  Coins,
  FileText,
  Lock,
  Mail,
  QrCode,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  type LucideIcon,
} from 'lucide-react-native'
import { ScreenHeader } from 'src/components/ScreenHeader'
import { useApp } from 'src/context/AppContext'
import { COLORES, SOMBRAS, RADIOS } from 'src/theme'

interface SeccionProps {
  icono: LucideIcon
  titulo: string
  parrafos: string[]
  vinetas?: string[]
  children?: ReactNode
}

function Seccion({ icono: Icono, titulo, parrafos, vinetas, children }: SeccionProps) {
  return (
    <View style={estilos.seccion}>
      <View style={estilos.seccionEncabezado}>
        <View style={estilos.seccionIcono}>
          <Icono size={20} color={COLORES.principal} />
        </View>
        <Text style={estilos.seccionTitulo}>{titulo}</Text>
      </View>

      {parrafos.map((parrafo) => (
        <Text key={parrafo} style={estilos.parrafo}>
          {parrafo}
        </Text>
      ))}

      {vinetas && (
        <View style={estilos.vinetas}>
          {vinetas.map((vineta) => (
            <View key={vineta} style={estilos.vineta}>
              <View style={estilos.punto} />
              <Text style={estilos.vinetaTexto}>{vineta}</Text>
            </View>
          ))}
        </View>
      )}

      {children}
    </View>
  )
}

export function PantallaDatosYCondiciones() {
  const { navigate } = useApp()

  return (
    <View style={estilos.pantalla}>
      <ScreenHeader title="Datos y condiciones" onBack={() => navigate('perfil')} />

      <ScrollView contentContainerStyle={estilos.contenido} showsVerticalScrollIndicator={false}>
        <View style={estilos.hero}>
          <View style={estilos.heroIcono}>
            <FileText size={30} strokeWidth={1.75} color={COLORES.principal} />
          </View>
          <Text style={estilos.heroTitulo}>Términos y privacidad</Text>
          <Text style={estilos.heroSubtitulo}>
            Cómo funciona TacherV2 y qué hacemos con tus datos.
          </Text>
          <Text style={estilos.actualizacion}>Última actualización: octubre de 2026</Text>
        </View>

        <View style={estilos.aviso}>
          <AlertTriangle size={18} color={COLORES.principal} />
          <Text style={estilos.avisoTexto}>
            Al usar la app aceptás estas condiciones. Si no estás de acuerdo, no uses el servicio.
          </Text>
        </View>

        <Seccion
          icono={ShieldCheck}
          titulo="1. Qué es TacherV2"
          parrafos={[
            'TacherV2 es una aplicación de reciclaje escolar que premia a los estudiantes por depositar residuos en las cajas recicladoras de la institución.',
            'La app se conecta con la caja física TacherV2, que lee el DNI del usuario y el código del residuo para acreditar los puntos correspondientes.',
          ]}
        />

        <Seccion
          icono={UserCheck}
          titulo="2. Tu cuenta"
          parrafos={[
            'Para usar la app tenés que registrarte con un correo electrónico y verificar tu cuenta, o iniciar sesión con Google.',
            'Cada cuenta debe estar vinculada a un único DNI, que se obtiene escaneando el código de barras del documento. No está permitido crear cuentas duplicadas ni usar el DNI de otra persona.',
          ]}
          vinetas={[
            'Sos responsable de mantener la confidencialidad de tu contraseña.',
            'La información de tu perfil debe ser verdadera y estar actualizada.',
            'Podés actualizar tu DNI desde la sección Perfil cuando sea necesario.',
          ]}
        />

        <Seccion
          icono={Coins}
          titulo="3. Puntos y rangos"
          parrafos={[
            'Los puntos se acreditan únicamente cuando la caja recicladora valida el DNI y el residuo. No se otorgan puntos por ingresos manuales ni por fuera del circuito de reciclaje.',
            'Los puntos no tienen valor monetario, no son transferibles y no pueden canjearse por dinero. Sirven exclusivamente para acceder a los productos disponibles en el kiosco de la escuela.',
            'Los rangos se calculan automáticamente según los puntos acumulados y pueden cambiar si se corrigen errores en el registro de reciclajes.',
          ]}
        />

        <Seccion
          icono={QrCode}
          titulo="4. Canjes"
          parrafos={[
            'Para canjear un producto generás un código QR desde la app. El código es personal, se muestra una sola vez y tiene una duración limitada.',
            'El canje se completa cuando el kiosco escanea el QR y entrega el producto. En ese momento se descuentan los puntos correspondientes.',
          ]}
          vinetas={[
            'Necesitás tener saldo suficiente de puntos al momento de generar el QR.',
            'Los productos están sujetos a disponibilidad y stock del kiosco.',
            'Un QR vencido, ya utilizado o generado por otra persona no es válido.',
            'Los canjes confirmados no se reembolsan, salvo error comprobable del sistema.',
          ]}
        />

        <Seccion
          icono={AlertTriangle}
          titulo="5. Uso aceptable"
          parrafos={[
            'Para que el sistema sea justo para todos, no está permitido manipular la caja recicladora, falsificar residuos, alterar el funcionamiento de la app ni intentar acceder a cuentas ajenas.',
            'Tampoco está permitido revender productos obtenidos mediante canjes ni usar la app con fines distintos al reciclaje escolar.',
            'El incumplimiento de estas reglas puede provocar la suspensión de la cuenta y la anulación de los puntos o canjes obtenidos de forma indebida.',
          ]}
        />

        <Seccion
          icono={Lock}
          titulo="6. Datos personales"
          parrafos={[
            'Recopilamos los datos necesarios para que el servicio funcione: nombre de usuario, correo electrónico, DNI vinculado, puntos, rango, historial de reciclajes y canjes.',
            'El DNI se usa exclusivamente para identificarte cuando la caja recicladora lee tu documento. No se comparte con terceros ajenos a la institución.',
            'Los datos se almacenan en Firebase (Google) con medidas razonables de seguridad. No vendemos ni cedemos tus datos con fines publicitarios.',
            'Podés solicitar la corrección o eliminación de tus datos a través de la administración de la escuela. Si eliminás tu cuenta, se pierden los puntos y los canjes pendientes.',
          ]}
        />

        <Seccion
          icono={RefreshCw}
          titulo="7. Cambios en el servicio"
          parrafos={[
            'Podemos modificar el funcionamiento de la app, los productos disponibles, el valor en puntos de los canjes o estas condiciones para mejorar el servicio o adaptarlo a las necesidades de la institución.',
            'Cuando haya cambios importantes, se informarán dentro de la app. El uso continuado del servicio implica la aceptación de las nuevas condiciones.',
          ]}
        />

        <Seccion
          icono={Mail}
          titulo="8. Contacto"
          parrafos={[
            'Si tenés dudas sobre estos términos, el funcionamiento de la app o el tratamiento de tus datos, comunicate con la administración de la escuela o con el equipo responsable de TacherV2.',
          ]}
        />

        <Text style={estilos.pie}>
          TacherV2 · Reciclá, sumá puntos y canjealos en el kiosco de tu escuela.
        </Text>
      </ScrollView>
    </View>
  )
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },
  contenido: {
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 36,
  },

  // --- Presentación
  hero: {
    alignItems: 'center',
    gap: 6,
  },
  heroIcono: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORES.verde200,
    backgroundColor: COLORES.suave,
    ...SOMBRAS.chica,
  },
  heroTitulo: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: -0.6,
    color: COLORES.texto,
  },
  heroSubtitulo: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 21,
    color: COLORES.textoSuave,
  },
  actualizacion: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: COLORES.gris400,
  },
  aviso: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORES.verde200,
    backgroundColor: COLORES.suave,
    padding: 14,
  },
  avisoTexto: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: COLORES.textoSuave,
  },

  // --- Secciones
  seccion: {
    gap: 10,
    borderRadius: RADIOS.tarjeta,
    borderWidth: 1,
    borderColor: COLORES.linea,
    backgroundColor: COLORES.blanco,
    padding: 18,
    ...SOMBRAS.chica,
  },
  seccionEncabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  seccionIcono: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: COLORES.suave,
  },
  seccionTitulo: {
    flex: 1,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    color: COLORES.texto,
  },
  parrafo: {
    fontSize: 14,
    lineHeight: 21,
    color: COLORES.textoSuave,
  },
  vinetas: {
    gap: 8,
  },
  vineta: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  punto: {
    width: 6,
    height: 6,
    marginTop: 7,
    borderRadius: 3,
    backgroundColor: COLORES.principal,
  },
  vinetaTexto: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: COLORES.textoSuave,
  },

  pie: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
    color: COLORES.gris400,
  },
})
