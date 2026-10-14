import React from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { BookOpen, ChevronRight, QrCode } from 'lucide-react-native'
import { Banner } from 'src/components/Banner'
import { COLORES, SOMBRAS } from 'src/theme'

interface Props {
  onInstrucciones: () => void
  onEscanear: () => void
}

function AccesoInstrucciones({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={estilos.acceso}>
      <View style={estilos.accesoIzquierda}>
        <View style={estilos.accesoIcono}>
          <BookOpen size={24} color={COLORES.principal} />
        </View>
        <View style={estilos.accesoTextos}>
          <Text style={estilos.accesoTitulo}>Instrucciones</Text>
          <Text style={estilos.accesoSubtitulo}>Cómo usar TeacherV2 como cajero</Text>
        </View>
      </View>
      <ChevronRight size={22} color={COLORES.principal} />
    </TouchableOpacity>
  )
}

function BotonEscanear({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={estilos.botonEscanear}>
      <View style={estilos.botonEscanearIcono}>
        <QrCode size={30} color={COLORES.blanco} />
      </View>
      <Text style={estilos.botonEscanearTexto}>Escanear QR</Text>
    </TouchableOpacity>
  )
}

export function PantallaInicio({ onInstrucciones, onEscanear }: Props) {
  return (
    <View style={estilos.pantalla}>
      <Banner />

      <ScrollView contentContainerStyle={estilos.contenido} showsVerticalScrollIndicator={false}>
        {/* Bloque central animado / llamativo */}
        <View style={estilos.contenedorHero}>
          <Text style={estilos.preTit}>¡BIENVENIDO, CAJERO!</Text>
          <Text style={estilos.tituloPrincipal}>
            TACHER<Text style={estilos.tituloMarca}>V2</Text>
          </Text>
          <Text style={estilos.subtituloCorto}>
            Validá QRs, descontá puntos y entregá premios al instante.
          </Text>
        </View>

        <AccesoInstrucciones onPress={onInstrucciones} />
      </ScrollView>

      <View style={estilos.pie}>
        <BotonEscanear onPress={onEscanear} />
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
    flexGrow: 1,
    justifyContent: 'center', // Ayuda a ubicarlo visualmente bien en el centro vertical de la pantalla disponible
    gap: 24,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 10,
  },
  contenedorHero: {
    alignItems: 'center',
    marginBottom: 10,
  },
  preTit: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 3,
    color: COLORES.principal,
    marginBottom: 15,
  },
  tituloPrincipal: {
    textAlign: 'center',
    fontSize: 90,
    fontFamily: 'sans-serif-condensed',
    lineHeight: 65,
    fontWeight: '900',
    letterSpacing: -1.5,
    color: COLORES.texto,
  },
  tituloMarca: {
    color: COLORES.principal,
  },
  subtituloCorto: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    color: COLORES.textoSuave,
    marginTop: 30,
    paddingHorizontal: 10,
  },

  // --- Acceso a las instrucciones
  acceso: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORES.linea,
    backgroundColor: COLORES.blanco,
    padding: 16,
    ...SOMBRAS.media, // Opcional, le da más relieve si usas sombras
  },
  accesoIzquierda: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  accesoIcono: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: COLORES.suave,
  },
  accesoTextos: {
    flex: 1,
  },
  accesoTitulo: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: COLORES.texto,
  },
  accesoSubtitulo: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORES.textoSuave,
  },

  // --- Zona fija de abajo
  pie: {
    gap: 4,
    paddingHorizontal: 20,
    paddingBottom: 12,
    paddingTop: 8,
  },
  botonEscanear: {
    height: 88,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    borderRadius: 26,
    backgroundColor: COLORES.principal,
    ...SOMBRAS.media,
  },
  botonEscanearIcono: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  botonEscanearTexto: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: COLORES.blanco,
  },
})