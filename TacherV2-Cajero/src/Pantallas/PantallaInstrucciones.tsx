import React from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { AlertCircle } from 'lucide-react-native'
import { BotonPrimario } from 'src/components/BotonPrimario'
import { ScreenHeader } from 'src/components/ScreenHeader'
import { COLORES, SOMBRAS } from 'src/theme'

const PASOS = [
  'Pedile al cliente que abra el producto que quiere canjear y toque “Generar QR”.',
  'En esta app tocá “Escanear QR” y apuntá la cámara al código que muestra el cliente.',
  'Esperá la confirmación. Si el canje es válido, se le descuentan los puntos al cliente.',
  'Entregá el producto que aparece en la pantalla de confirmación.',
]

const SI_ALGO_FALLA = [
  { titulo: 'QR vencido', texto: 'Dura 5 minutos. Pedile al cliente que genere uno nuevo.' },
  { titulo: 'Canje ya finalizado', texto: 'Ese QR ya se usó. No entregues nada.' },
  { titulo: 'Puntos insuficientes', texto: 'El canje no se puede hacer hasta que el cliente sume puntos.' },
]

export function PantallaInstrucciones({ onVolver }: { onVolver: () => void }) {
  return (
    <View style={estilos.pantalla}>
      <ScreenHeader title="Instrucciones" onBack={onVolver} />

      <ScrollView contentContainerStyle={estilos.contenido} showsVerticalScrollIndicator={false}>
        
        {/* Encabezado animado / dinámico */}
        <View style={estilos.seccionHeader}>
          <Text style={estilos.preTitulo}>GUÍA RÁPIDA</Text>
          <Text style={estilos.titulo}>Como canjear un producto</Text>
        </View>

        {/* Tarjeta de pasos con números de color primario y sombras */}
        <View style={estilos.tarjetaPasos}>
          {PASOS.map((paso, indice) => {
            const esUltimo = indice === PASOS.length - 1
            return (
              <View key={paso} style={estilos.pasoContenedor}>
                <View style={estilos.columnaIzquierda}>
                  <View style={estilos.numeroBadge}>
                    <Text style={estilos.numeroTexto}>{indice + 1}</Text>
                  </View>
                  {!esUltimo && <View style={estilos.lineaConectora} />}
                </View>
                <View style={estilos.contenidoPaso}>
                  <Text style={estilos.pasoTexto}>{paso}</Text>
                </View>
              </View>
            )
          })}
        </View>

        {/* Sección de problemas con borde acentuado e íconos */}
        <View style={[estilos.seccionHeader, { marginTop: 12 }]}>
          <Text style={estilos.preTitulo}>RESOLUCIÓN DE PROBLEMAS</Text>
          <Text style={estilos.titulo}>Si algo falla</Text>
        </View>

        <View style={estilos.contenedorProblemas}>
          {SI_ALGO_FALLA.map(({ titulo, texto }) => (
            <View key={titulo} style={estilos.tarjetaProblema}>
              <View style={estilos.problemaHeader}>
                <AlertCircle size={20} color={COLORES.principal} />
                <Text style={estilos.problemaTitulo}>{titulo}</Text>
              </View>
              <Text style={estilos.problemaTexto}>{texto}</Text>
            </View>
          ))}
        </View>

      </ScrollView>

      <View style={estilos.pie}>
        <BotonPrimario label="Entendido" onPress={onVolver} />
      </View>
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
    paddingBottom: 28,
    paddingTop: 16,
  },
  seccionHeader: {
    gap: 2,
  },
  preTitulo: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 2,
    color: COLORES.principal,
  },
  // Título estándar (sin sans-serif-condensed) pero manteniendo la fuerza visual
  titulo: {
    fontSize: 25,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: COLORES.texto,
  },

  // --- Estilos Timeline / Pasos (Recuperado el diseño con SOMBRAS y Badge de color)
  tarjetaPasos: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORES.linea,
    backgroundColor: COLORES.blanco,
    padding: 20,
    ...SOMBRAS.media,
  },
  pasoContenedor: {
    flexDirection: 'row',
    gap: 16,
  },
  columnaIzquierda: {
    alignItems: 'center',
  },
  numeroBadge: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: COLORES.principal,
  },
  numeroTexto: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    color: COLORES.blanco,
  },
  lineaConectora: {
    width: 2,
    flex: 1,
    backgroundColor: COLORES.suave,
    marginVertical: 4,
  },
  contenidoPaso: {
    flex: 1,
    paddingBottom: 24,
    justifyContent: 'center',
  },
  pasoTexto: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    color: COLORES.texto,
  },

  // --- Estilos Tarjetas de Problemas (Recuperado el borde de color e íconos)
  contenedorProblemas: {
    gap: 12,
  },
  tarjetaProblema: {
    gap: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORES.linea,
    backgroundColor: COLORES.blanco,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORES.principal,
    ...SOMBRAS.media,
  },
  problemaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  problemaTitulo: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: COLORES.texto,
  },
  problemaTexto: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORES.textoSuave,
  },

  // --- Pie fijo
  pie: {
    borderTopWidth: 1,
    borderTopColor: COLORES.linea,
    backgroundColor: COLORES.blanco,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
})