import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { getRangoParaPuntos, RANGOS } from 'src/domain/rangos'
import { COLORES } from 'src/theme'

type EstadoPaso = 'completado' | 'actual' | 'pendiente'

/** Muestra los rangos en fila (Brote, Planta, Árbol) y en cuál está el usuario. */
export function CaminoDeRangos({ puntos }: { puntos: number }) {
  const indiceActual = RANGOS.indexOf(getRangoParaPuntos(puntos))

  return (
    <View style={estilos.tarjeta}>
      <Text style={estilos.titulo}>Tu camino</Text>

      <View style={estilos.fila}>
        {RANGOS.map((rango, indice) => {
          const estado: EstadoPaso =
            indice < indiceActual ? 'completado' : indice === indiceActual ? 'actual' : 'pendiente'
          const Icono = rango.icon
          const colorIcono =
            estado === 'completado'
              ? COLORES.blanco
              : estado === 'actual'
                ? COLORES.oscuro
                : COLORES.gris400

          return (
            <React.Fragment key={rango.name}>
              {indice > 0 && (
                <View style={[estilos.linea, indice <= indiceActual && estilos.lineaCompletada]} />
              )}
              <View style={estilos.paso}>
                <View
                  style={[
                    estilos.circulo,
                    estado === 'completado' && estilos.circuloCompletado,
                    estado === 'actual' && estilos.circuloActual,
                  ]}
                >
                  <Icono size={20} color={colorIcono} />
                </View>
                <Text style={[estilos.nombre, estado === 'actual' && estilos.nombreActual]}>
                  {rango.name}
                </Text>
              </View>
            </React.Fragment>
          )
        })}
      </View>
    </View>
  )
}

const estilos = StyleSheet.create({
  tarjeta: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORES.linea,
    backgroundColor: COLORES.blanco,
    padding: 16,
  },
  titulo: {
    marginBottom: 14,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: COLORES.texto,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  paso: {
    width: 60,
    alignItems: 'center',
    gap: 6,
  },
  circulo: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: COLORES.gris200,
  },
  circuloCompletado: {
    backgroundColor: COLORES.principal,
  },
  circuloActual: {
    backgroundColor: COLORES.acento,
  },
  nombre: {
    fontSize: 13,
    lineHeight: 17,
    color: COLORES.textoSuave,
  },
  nombreActual: {
    fontWeight: '600',
    color: COLORES.texto,
  },
  linea: {
    flex: 1,
    height: 2,
    marginTop: 19,
    backgroundColor: COLORES.gris200,
  },
  lineaCompletada: {
    backgroundColor: COLORES.principal,
  },
})
