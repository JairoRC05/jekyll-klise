// === sync-firestore.js ===
// 🔄 Sincronizador entre Firebase Firestore y el sistema local (gestión de equipos y transferencias)

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// === CONFIGURACIÓN FIREBASE ===
const firebaseConfig = {
  apiKey: "AIzaSyBXznASeaw8vtU6OWwiP2kkVBh0L0b45y4",
  authDomain: "unite-mex.firebaseapp.com",
  projectId: "unite-mex",
  storageBucket: "unite-mex.appspot.com",
  messagingSenderId: "248961873504",
  appId: "1:248961873504:web:b9ad5434d6a1041bc73505"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("✅ Sync-Firestore conectado con Firebase");

// === 🔽 Descargar equipos desde Firestore ===
export async function syncTeamsFromFirestore(temp = "equipos") {
  try {
    Swal.fire({
      title: "Sincronizando equipos...",
      html: `Obteniendo datos de <b>${temp}</b> desde Firestore ⏳`,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    const equiposSnap = await getDocs(collection(db, temp));
    const equipos = equiposSnap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    localStorage.setItem("allTeamData", JSON.stringify(equipos));

    Swal.fire({
      icon: "success",
      title: "Equipos actualizados",
      text: `Se cargaron ${equipos.length} equipos desde Firestore`,
      timer: 2000,
      showConfirmButton: false
    });

    console.log(`🔥 ${equipos.length} equipos sincronizados desde ${temp}`);
    return [...equipos];
  } catch (error) {
    console.error("❌ Error al sincronizar desde Firestore:", error);
    Swal.fire("Error", "No se pudieron descargar los equipos", "error");
    return [];
  }
}




// === 🔼 Subir equipos (jugadores y metadatos) a Firestore ===
export async function syncTransfersToFirestore(temp = "equipos") {
  try {


    // Recuperar los equipos desde localStorage
    const equipos = JSON.parse(localStorage.getItem("allTeamData") || "[]");

    if (!Array.isArray(equipos) || equipos.length === 0) {
      Swal.fire("Sin datos", "No hay equipos locales para sincronizar", "info");
      console.warn("⚠️ No hay equipos en localStorage o el formato no es válido.");
      return;
    }

    Swal.fire({
      title: "Subiendo cambios...",
      html: "Actualizando equipos y jugadores en Firestore ⚙️",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    let count = 0;

    // 🔁 Recorremos cada equipo
    for (const eq of equipos) {
      if (!eq.id) {
        console.warn(`⚠️ Equipo sin ID en localStorage:`, eq);
        continue;
      }

      const ref = doc(db, temp, eq.id);

      // Preparamos los datos que se van a actualizar
      const dataToUpdate = {
        nombreEquipo: eq.team || eq.nombreEquipo || "Sin nombre",
        tagEquipo: eq.tag || eq.tagEquipo || "SIN_TAG",
        capitanNombre: eq.capitan || eq.capitanNombre || "N/A",
        jugadores: eq.jugadores || [],
        region: eq.region || "LAN",
        grupo: eq.grupo || "",
        seguro: eq.seguro ?? false,
        link: eq.link || "",
        activo: eq.activo ?? true,
        fechaActualizacion: new Date().toISOString()
      };

      // Muestra en consola lo que se está subiendo
      console.log(`⬆️ Subiendo equipo ${eq.id}:`, dataToUpdate);

      // Actualizamos el documento en Firestore
      await updateDoc(ref, dataToUpdate);
      count++;
    }

    Swal.fire({
      icon: "success",
      title: "Sincronización completa",
      text: `${count} equipos actualizados correctamente`,
      showConfirmButton: false,
      timer: 2000
    });

    console.log(`✅ ${count} equipos actualizados en la colección ${temp}.`);
  } catch (error) {
    console.error("❌ Error al subir a Firestore:", error);
    Swal.fire("Error", "No se pudieron subir los cambios a Firestore", "error");
  }
}

