import React, { useState } from 'react'
import {
 ScrollView,
 StyleSheet,
 Text,
 TouchableOpacity,
 View,
 type StyleProp,
 type ViewStyle,
} from 'react-native'
import { Crown, Recycle, Sparkles, ChevronDown, ChevronUp, User } from 'lucide-react-native'
import { BarraDeNavegacion } from 'src/components/BarraDeNavegacion'
import { Encabezado } from 'src/components/Encabezado'
import { MensajeError } from 'src/components/MensajeError'
import { useApp } from 'src/context/AppContext'
import { useNavegacionPestañas } from 'src/hooks/useNavegacionPestañas'
import { useRanking } from 'src/hooks/useRanking'
import type { PuestoRanking } from 'src/services/ranking'
import { COLORES, SOMBRAS } from 'src/theme'
import { EsqueletoPodio } from 'src/components/EsqueletoPodio'
import { CaminoDeRangos } from 'src/components/CaminoDeRangos'
import { SelectorBeneficios } from 'src/components/SelectorBeneficios'
import { getResumenRangoPorReciclajes } from 'src/domain/rangos'


// ---------------------------------------------------------------------------
// Constantes del podio
// ---------------------------------------------------------------------------


const ORDEN_PODIO = [1, 0, 2] // Segundo, Primero, Tercero


// ---------------------------------------------------------------------------
// Adornos
// ---------------------------------------------------------------------------


function Destello({
 posicion,
 tamaño = 18,
}: {
 posicion: StyleProp<ViewStyle>
 tamaño?: number
}) {
 return (
   <View style={[estilos.destello, posicion]}>
     <Sparkles size={tamaño} color={COLORES.acento} />
   </View>
 )
}


// ---------------------------------------------------------------------------
// Podio (Top 3 grande, compacto y estilizado como la referencia)
// ---------------------------------------------------------------------------


interface ColumnaPodioProps {
 indice: number
 puesto?: PuestoRanking
 esUsuario: boolean
}


function ColumnaPodio({ indice, puesto, esUsuario }: ColumnaPodioProps) {
 const esPrimero = indice === 0
 const tamañoAvatar = esPrimero ? 90 : 72 // Más grandes para que no se vean chiquitos


 return (
   <View style={[estilos.columnaPodio, esPrimero && estilos.columnaPodioCentro]}>
     {/* Corona más grande exclusivamente para el puesto 1 */}
     {esPrimero && puesto && (
       <View style={estilos.coronaContainer}>
         <Crown size={38} color={COLORES.acento} />
       </View>
     )}


     {/* Número de puesto solo para el 2 y 3, con color bien visible */}
     {!esPrimero && (
       <Text style={estilos.numeroPuestoPodio}>{indice + 1}</Text>
     )}


     <View
       style={[
         estilos.avatarPodioEstiloFoto,
         {
           width: tamañoAvatar,
           height: tamañoAvatar,
           borderRadius: tamañoAvatar / 2,
           borderColor: esUsuario ? COLORES.acento : 'rgba(255, 255, 255, 0.25)',
           backgroundColor: 'rgba(255, 255, 255, 0.08)',
         },
         !puesto && estilos.avatarVacio,
       ]}
     >
       <User size={esPrimero ? 44 : 34} color={esUsuario ? COLORES.acento : COLORES.blanco} />
     </View>


     <Text style={estilos.nombrePodio} numberOfLines={1}>
       {puesto ? puesto.nombre : 'Libre'}
     </Text>


     {puesto && (
       <View style={estilos.puntosPodioFila}>
         <Recycle size={14} color={COLORES.acento} />
         <Text style={estilos.puntosPodioTexto}>
           {((puesto as any).reciclajes ?? puesto.cantidad ?? 0).toLocaleString('es-AR')}
         </Text>
       </View>
     )}
   </View>
 )
}


function Podio({ puestos, usuarioId }: { puestos: PuestoRanking[]; usuarioId?: string }) {
 return (
   <View style={estilos.podioContainer}>
     {ORDEN_PODIO.map((indice) => (
       <ColumnaPodio
         key={indice}
         indice={indice}
         puesto={puestos[indice]}
         esUsuario={Boolean(usuarioId) && puestos[indice]?.id === usuarioId}
       />
     ))}
   </View>
 )
}


// ---------------------------------------------------------------------------
// Fila de Puestos en Cápsulas (4 en adelante)
// ---------------------------------------------------------------------------


interface FilaPuestoProps {
 puesto: PuestoRanking
 posicion: number
 esUsuario: boolean
}


function FilaPuesto({ puesto, posicion, esUsuario }: FilaPuestoProps) {
 return (
   <View style={[estilos.filaCapsula, esUsuario && estilos.filaCapsulaUsuario]}>
     <View style={estilos.capsulaIzquierda}>
       <Text style={estilos.capsulaPosicion}>{posicion}</Text>
       <View style={estilos.capsulaAvatar}>
         <User size={20} color={esUsuario ? COLORES.acento : COLORES.blanco} />
       </View>
       <View style={estilos.capsulaTextos}>
         <Text style={estilos.capsulaNombre} numberOfLines={1}>
           {puesto.nombre}
         </Text>
         {esUsuario && <Text style={estilos.capsulaVos}>Vos</Text>}
       </View>
     </View>


     <View style={estilos.capsulaPuntosContenedor}>
       <Recycle size={16} color={COLORES.acento}  />
       <Text style={estilos.capsulaPuntos}>
         {((puesto as any).reciclajes ?? puesto.cantidad ?? 0).toLocaleString('es-AR')}
       </Text>
     </View>
   </View>
 )
}


// ---------------------------------------------------------------------------
// Pantalla Principal
// ---------------------------------------------------------------------------


export function PantallaRanking() {
 const { userData } = useApp()
 const handleTabPress = useNavegacionPestañas()
 const { puestos, cargando, error } = useRanking()
 const [mostrarTodos, setMostrarTodos] = useState(false)


  const reciclajes = Number((userData as any)?.reciclajes ?? (userData as any)?.Reciclajes ?? 0) || 0
  const resumenRango = getResumenRangoPorReciclajes(reciclajes)
  const rangoActual = userData?.Rango || resumenRango.actual.name


  const podio = puestos.slice(0, 3)
 const puestosRestantes = puestos.slice(3, 10)
 const visibles = mostrarTodos ? puestosRestantes : puestosRestantes.slice(0, 3)


 return (
   <View style={estilos.pantalla}>
     <Encabezado />


     <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={estilos.scrollContainer}>
      
       {/* Bloque Principal */}
       <View style={estilos.heroContainer}>
         <View style={estilos.circuloDecorativoUno} />
         <View style={estilos.circuloDecorativoDos} />
         <Destello posicion={estilos.destelloUno} tamaño={20} />
         <Destello posicion={estilos.destelloDos} />


         <Text style={estilos.titulo}>
           Ranking de {'\n'}
           <Text style={estilos.tituloAcento}>Recicladores</Text>
         </Text>
         <Text style={estilos.subtituloHero}>Los 10 que más reciclan en la caja TeacherV2</Text>


         {cargando ? (
           <EsqueletoPodio />
         ) : error ? (
           <View style={estilos.estadoHero}>
             <MensajeError message={error} />
           </View>
         ) : podio.length === 0 ? (
           <Text style={estilos.sinRanking}>
             Todavía no hay recicladores en el ranking. ¡Podés ser el primero!
           </Text>
         ) : (
           <Podio puestos={podio} usuarioId={userData?.id} />
         )}


         {/* Lista de posiciones en cápsulas translúcidas */}
         {puestosRestantes.length > 0 && (
           <View style={estilos.capsulasContainer}>
             {visibles.map((puesto, indice) => (
               <FilaPuesto
                 key={puesto.id}
                 puesto={puesto}
                 posicion={indice + 4}
                 esUsuario={Boolean(userData?.id) && puesto.id === userData?.id}
               />
             ))}


             {puestosRestantes.length > 3 && (
               <TouchableOpacity
                 activeOpacity={0.8}
                 onPress={() => setMostrarTodos(!mostrarTodos)}
                 style={estilos.botonVerMasOscuro}
               >
                 <Text style={estilos.textoBotonVerMasOscuro}>
                   {mostrarTodos ? 'Ver menos' : 'Ver más posiciones'}
                 </Text>
                 {mostrarTodos ? (
                   <ChevronUp size={16} color={COLORES.acento} />
                 ) : (
                   <ChevronDown size={16} color={COLORES.acento} />
                 )}
               </TouchableOpacity>
             )}
           </View>
         )}
       </View>

       
        <View style={estilos.seccionCamino}>
          <CaminoDeRangos puntos={reciclajes} rangoActual={rangoActual}/>
        </View>

       {/* Sección inferior: Selector de Beneficios */}
       <View style={estilos.cuerpoInferior}>
         <SelectorBeneficios reciclajes={reciclajes} />
       </View>


     </ScrollView>


     <BarraDeNavegacion activeTab="ranking" onTabPress={handleTabPress} />
   </View>
 )
}


const estilos = StyleSheet.create({
 pantalla: {
   flex: 1,
   backgroundColor: COLORES.fondo,
 },
 scrollContainer: {
   paddingBottom: 36,
 },


 heroContainer: {
   alignItems: 'center',
   overflow: 'hidden',
   backgroundColor: COLORES.oscuro,
   paddingHorizontal: 16,
   paddingTop: 20,
   paddingBottom: 28,
 },
 circuloDecorativoUno: {
   position: 'absolute',
   left: -60,
   top: -30,
   width: 200,
   height: 200,
   borderRadius: 100,
   backgroundColor: COLORES.principal,
   opacity: 0.25,
 },
 circuloDecorativoDos: {
   position: 'absolute',
   right: -70,
   bottom: 120,
   width: 220,
   height: 220,
   borderRadius: 110,
   backgroundColor: COLORES.principal,
   opacity: 0.18,
 },
 destello: {
   position: 'absolute',
   opacity: 0.75,
 },
 destelloUno: { left: 24, top: 20 },
 destelloDos: { right: 28, top: 50 },


 titulo: {
   marginTop: 10,
   textAlign: 'center',
   fontSize: 34,
   lineHeight: 40,
   fontWeight: '800',
   letterSpacing: -1,
   color: COLORES.blanco,
 },
 tituloAcento: {
   color: COLORES.acento,
 },
 subtituloHero: {
   marginTop: 6,
   textAlign: 'center',
   fontSize: 14,
   lineHeight: 20,
   color: COLORES.sobreOscuro,
   marginBottom: 10,
 },
 estadoHero: {
   width: '100%',
   marginTop: 20,
 },
 sinRanking: {
   marginTop: 24,
   textAlign: 'center',
   fontSize: 14,
   color: COLORES.sobreOscuro,
 },


 // Podio ajustado, más grande y junto
 podioContainer: {
   width: '100%',
   flexDirection: 'row',
   alignItems: 'flex-end',
   justifyContent: 'center',
   gap: 8,
   marginTop: 12,
   marginBottom: 24,
 },
 columnaPodio: {
   flex: 1,
   alignItems: 'center',
 },
 columnaPodioCentro: {
   transform: [{ translateY: -16 }],
 },
 coronaContainer: {
   zIndex: 2,
 },
 numeroPuestoPodio: {
   fontSize: 14,
   fontWeight: '800',
   color: COLORES.blanco,
   marginBottom: 4,
 },
 avatarPodioEstiloFoto: {
   alignItems: 'center',
   justifyContent: 'center',
   borderWidth: 2.5,
 },
 avatarVacio: {
   borderStyle: 'dashed',
   opacity: 0.5,
 },
 nombrePodio: {
   width: '100%',
   textAlign: 'center',
   fontSize: 14,
   fontWeight: '700',
   color: COLORES.blanco,
   marginTop: 8,
 },
 puntosPodioFila: {
   flexDirection: 'row',
   alignItems: 'center',
   gap: 4,
   marginTop: 3,
 },
 puntosPodioTexto: {
   fontSize: 13,
   fontWeight: '700',
   color: COLORES.acento,
 },


 capsulasContainer: {
   width: '100%',
   gap: 10,
 },
 filaCapsula: {
   flexDirection: 'row',
   alignItems: 'center',
   justifyContent: 'space-between',
   gap: 12, // separa el nombre (o "Vos") del ícono de reciclaje
   backgroundColor: 'rgba(255, 255, 255, 0.06)',
   borderRadius: 9999,
   paddingVertical: 12,
   paddingHorizontal: 16,
   borderWidth: 1,
   borderColor: 'rgba(255, 255, 255, 0.08)',
 },
 filaCapsulaUsuario: {
   borderColor: COLORES.acento,
   backgroundColor: 'transparent',
 },
 capsulaIzquierda: {
   flexDirection: 'row',
   alignItems: 'center',
   gap: 14,
   flex: 1,
 },
 capsulaPosicion: {
   fontSize: 16,
   fontWeight: '800',
   color: COLORES.blanco,
   width: 20,
   textAlign: 'center',
 },
 capsulaAvatar: {
   width: 38,
   height: 38,
   borderRadius: 19,
   backgroundColor: 'rgba(255, 255, 255, 0.1)',
   alignItems: 'center',
   justifyContent: 'center',
 },
 capsulaTextos: {
   flex: 1,
   flexDirection: 'row',
   alignItems: 'center',
   gap: 8,
 },
 capsulaNombre: {
   fontSize: 15,
   fontWeight: '600',
   color: COLORES.blanco,
   flex: 1,
 },
 capsulaVos: {
   fontSize: 10,
   fontWeight: '700',
   color: COLORES.oscuro,
   backgroundColor: COLORES.acento,
   paddingHorizontal: 6,
   paddingVertical: 2,
   borderRadius: 9999,
 },
 capsulaPuntosContenedor: {
   flexDirection: 'row',
   alignItems: 'center',
   gap: 6,
 },
 capsulaPuntos: {
   fontSize: 15,
   fontWeight: '700',
   color: COLORES.acento,
 },
 botonVerMasOscuro: {
   flexDirection: 'row',
   alignItems: 'center',
   justifyContent: 'center',
   gap: 6,
   paddingVertical: 12,
   borderRadius: 9999,
   backgroundColor: 'rgba(255, 255, 255, 0.05)',
   borderWidth: 1,
   borderColor: 'rgba(255, 255, 255, 0.15)',
   marginTop: 6,
 },
 textoBotonVerMasOscuro: {
   fontSize: 14,
   fontWeight: '600',
   color: COLORES.acento,
 },


 cuerpoInferior: {
   paddingHorizontal: 10,
   paddingTop: 24,
 },
  seccionCamino: {
    gap: 12,
   paddingHorizontal: 10,
   paddingTop: 15,
 }
})




