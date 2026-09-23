import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  deleteField,
} from "firebase/firestore";
import { db } from "../src/firebase"; // Asegurate de que la ruta a tu config sea correcta

export default function IndexScreen() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [logMessage, setLogMessage] = useState("Consola de eventos de Firebase...");

  // Formulario simple para creación/actualización
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [dni, setDni] = useState("");
  const [idSeleccionado, setIdSeleccionado] = useState("");

  const addLog = (msg) => {
    console.log(msg);
    setLogMessage((prev) => `${msg}\n---\n${prev}`);
  };

  // 1. LEER TODOS LOS USUARIOS
  const obtenerTodosLosUsuarios = async () => {
    setLoading(true);
    try {
      const usuariosRef = collection(db, "USUARIOS");
      const querySnapshot = await getDocs(usuariosRef);

      const lista = [];
      querySnapshot.forEach((docSnap) => {
        lista.push({
          id: docSnap.id,
          ...docSnap.data(),
        });
      });

      setUsuarios(lista);
      addLog(`[ÉXITO] Se obtuvieron ${lista.length} usuarios de Firestore.`);
    } catch (error) {
      addLog(`[ERROR] al leer usuarios: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Cargar usuarios al iniciar
  useEffect(() => {
    obtenerTodosLosUsuarios();
  }, []);

  // 2. LEER UN SOLO USUARIO
  const obtenerUnUsuario = async (id) => {
    if (!id) return Alert.alert("Atención", "Ingresá un ID de usuario");
    setLoading(true);
    try {
      const usuarioRef = doc(db, "USUARIOS", id);
      const docSnapshot = await getDoc(usuarioRef);

      if (docSnapshot.exists()) {
        const datos = docSnapshot.data();
        addLog(`[USUARIO ENCONTRADO] ID: ${id}\nNombre: ${datos.Nombre}\nPuntos: ${datos.Puntos || 0}`);
      } else {
        addLog(`[INFO] El usuario con ID ${id} no existe.`);
      }
    } catch (error) {
      addLog(`[ERROR] al obtener usuario: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 3. CREAR NUEVO USUARIO
  const crearNuevoUsuario = async () => {
    if (!nombre || !email) {
      return Alert.alert("Campos vacíos", "Completá nombre y email al menos.");
    }
    setLoading(true);
    try {
      const usuariosRef = collection(db, "USUARIOS");
      const nuevoUsuario = {
        Nombre: nombre,
        Email: email,
        DNI: dni || "N/A",
        Puntos: 0,
        Rango: "Bronce",
        Fecha_Registro: new Date().toISOString(),
        Activo: true,
      };

      const docRef = await addDoc(usuariosRef, nuevoUsuario);
      addLog(`[CREADO] Usuario creado con ID automático: ${docRef.id}`);

      // Limpiar inputs y recargar
      setNombre("");
      setEmail("");
      setDni("");
      obtenerTodosLosUsuarios();
    } catch (error) {
      addLog(`[ERROR] al crear usuario: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 4. CREAR/REEMPLAZAR CON ID PERSONALIZADO (setDoc)
  const crearUsuarioConIDPersonalizado = async (customId) => {
    if (!customId) return Alert.alert("Atención", "Escribí un ID específico");
    setLoading(true);
    try {
      await setDoc(doc(db, "USUARIOS", customId), {
        Nombre: nombre ,
        Email: email || "ejemplo@escuela.com",
        Puntos: 100,
        Rango: "Plata",
      });
      addLog(`[SETDOC] Documento guardado con ID: ${customId}`);
      obtenerTodosLosUsuarios();
    } catch (error) {
      addLog(`[ERROR] setDoc: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 5. ACTUALIZAR CAMPOS ESPECÍFICOS (updateDoc)
  const modificarPuntosDelUsuario = async (id, nuevosPuntos) => {
    if (!id) return Alert.alert("Atención", "Ingresá o seleccioná un ID");
    setLoading(true);
    try {
      const usuarioRef = doc(db, "USUARIOS", id);
      await updateDoc(usuarioRef, {
        Puntos: nuevosPuntos,
        Rango: nuevosPuntos > 300 ? "Oro" : "Plata",
      });
      addLog(`[ACTUALIZADO] Puntos cambiados a ${nuevosPuntos} para el ID: ${id}`);
      obtenerTodosLosUsuarios();
    } catch (error) {
      addLog(`[ERROR] al actualizar puntos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 6. BORRAR UN CAMPO ESPECÍFICO (deleteField)
  const borrarCampoDni = async (id) => {
    if (!id) return Alert.alert("Atención", "Ingresá un ID");
    setLoading(true);
    try {
      const usuarioRef = doc(db, "USUARIOS", id);
      await updateDoc(usuarioRef, {
        DNI: deleteField(),
      });
      addLog(`[CAMPO BORRADO] Se eliminó el campo 'DNI' de: ${id}`);
      obtenerTodosLosUsuarios();
    } catch (error) {
      addLog(`[ERROR] al borrar campo: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 7. BORRAR DOCUMENTO COMPLETO (deleteDoc)
  const borrarUsuario = async (id) => {
    if (!id) return Alert.alert("Atención", "Ingresá un ID a borrar");
    setLoading(true);
    try {
      const usuarioRef = doc(db, "USUARIOS", id);
      await deleteDoc(usuarioRef);
      addLog(`[ELIMINADO] Usuario ${id} fue borrado.`);
      obtenerTodosLosUsuarios();
    } catch (error) {
      addLog(`[ERROR] al borrar usuario: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>CRUD Firebase Firestore</Text>
      <Text style={styles.subtitle}>Colección: USUARIOS</Text>

      {/* FORMULARIO */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Formulario / Datos</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre completo"
          value={nombre}
          onChangeText={setNombre}
        />
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="DNI"
          value={dni}
          onChangeText={setDni}
        />
        <TextInput
          style={styles.input}
          placeholder="ID de Usuario (para buscar/actualizar/borrar)"
          value={idSeleccionado}
          onChangeText={setIdSeleccionado}
        />

        {/* ACCIONES */}
        <View style={styles.buttonGrid}>
          <TouchableOpacity style={[styles.btn, styles.btnGreen]} onPress={crearNuevoUsuario}>
            <Text style={styles.btnText}>Crear (addDoc)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.btnBlue]}
            onPress={() => obtenerUnUsuario(idSeleccionado)}
          >
            <Text style={styles.btnText}>Buscar Uno (getDoc)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.btnOrange]}
            onPress={() => modificarPuntosDelUsuario(idSeleccionado, 500)}
          >
            <Text style={styles.btnText}>Sumar 500 Pts (updateDoc)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.btnGray]}
            onPress={() => borrarCampoDni(idSeleccionado)}
          >
            <Text style={styles.btnText}>Borrar DNI (deleteField)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.btnPurple]}
            onPress={() => crearUsuarioConIDPersonalizado(idSeleccionado || "user_999")}
          >
            <Text style={styles.btnText}>Set ID Personalizado (setDoc)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.btnRed]}
            onPress={() => borrarUsuario(idSeleccionado)}
          >
            <Text style={styles.btnText}>Borrar Doc (deleteDoc)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* BOTÓN REFRESCAR */}
      <TouchableOpacity style={styles.btnRefresh} onPress={obtenerTodosLosUsuarios}>
        <Text style={styles.btnRefreshText}>🔄 Recargar Todos (getDocs)</Text>
      </TouchableOpacity>

      {/* LISTADO DE USUARIOS EN PANTALLA */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Estudiantes Registrados ({usuarios.length})</Text>
        {loading && <ActivityIndicator size="small" color="#007AFF" />}
        {usuarios.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.userCard}
            onPress={() => {
              setIdSeleccionado(item.id);
              setNombre(item.Nombre || "");
              setEmail(item.Email || "");
              setDni(item.DNI || "");
            }}
          >
            <Text style={styles.userId}>ID: {item.id}</Text>
            <Text>Nombre: {item.Nombre}</Text>
            <Text>Email: {item.Email}</Text>
            <Text>DNI: {item.DNI || "—"}</Text>
            <Text>Puntos: {item.Puntos ?? 0} | Rango: {item.Rango || "Sin rango"}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LOG / CONSOLA INTERNA */}
      <View style={styles.consoleCard}>
        <Text style={styles.consoleTitle}>Terminal / Logs:</Text>
        <ScrollView style={styles.consoleScroll} nestedScrollEnabled={true}>
          <Text style={styles.consoleText}>{logMessage}</Text>
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f5f7",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
    color: "#1c1c1e",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    fontSize: 14,
    backgroundColor: "#fafafa",
  },
  buttonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 6,
  },
  btn: {
    width: "48%",
    paddingVertical: 10,
    borderRadius: 6,
    marginBottom: 8,
    alignItems: "center",
  },
  btnGreen: { backgroundColor: "#2e7d32" },
  btnBlue: { backgroundColor: "#0288d1" },
  btnOrange: { backgroundColor: "#ed6c02" },
  btnGray: { backgroundColor: "#757575" },
  btnPurple: { backgroundColor: "#7b1fa2" },
  btnRed: { backgroundColor: "#d32f2f" },
  btnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  btnRefresh: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  btnRefreshText: {
    color: "#fff",
    fontWeight: "bold",
  },
  userCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 4,
    marginBottom: 8,
  },
  userId: {
    fontWeight: "bold",
    fontSize: 12,
    color: "#007AFF",
    marginBottom: 2,
  },
  consoleCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    maxHeight: 200,
  },
  consoleTitle: {
    color: "#aaa",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 6,
  },
  consoleScroll: {
    maxHeight: 150,
  },
  consoleText: {
    color: "#00ff66",
    fontFamily: "monospace",
    fontSize: 11,
  },
});