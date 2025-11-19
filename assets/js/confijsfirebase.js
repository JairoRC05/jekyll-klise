 // Inicializar Firebase (solo una vez en todo el sitio)
  if (!firebase.apps.length) {
    const firebaseConfig = {
      apiKey: "AIzaSyBXznASeaw8vtU6OWwiP2kkVBh0L0b45y4",
      authDomain: "unite-mex.firebaseapp.com",
      projectId: "unite-mex",
      appId: "1:248961873504:web:b9ad5434d6a1041bc73505"
    };
    firebase.initializeApp(firebaseConfig);
  }

  const auth = firebase.auth();
  const db = firebase.firestore();

 