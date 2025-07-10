const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// por favor, não faça merda aqui

// Só use esse script em caso de necessidade extrema

const firebaseConfig = {
  apiKey: "AIzaSyC52svDmVusLYswOmZqFhB8BwlvVAlr4As",
  authDomain: "ibmec-jr-solucoes.firebaseapp.com",
  projectId: "ibmec-jr-solucoes",
  storageBucket: "ibmec-jr-solucoes.appspot.com",
  messagingSenderId: "787954916425",
  appId: "1:787954916425:web:826c5ef12de4c207f13398"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdminUser() {
  const email = "admin@ibmecjrsolucoes.com.br";
  const password = "123456";
  let uid;

  try {
    // Tenta criar o usuário
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    uid = userCredential.user.uid;
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        uid = userCredential.user.uid;
      } catch (loginError) {
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }

  // Criar documento no Firestore
  try {
    await setDoc(doc(db, "users", uid), {
      id: uid,
      nome: "Administrador do Sistema",
      email: email,
      role: "Administrador",
      setor: "Diretoria",
      status: "Ativo",
      dataEntradaEmpresa: new Date().toISOString().split('T')[0],
      advertencias: 0,
      notificacoes: 0,
      isPowerUser: true,
      isAdmin: true,
      createdAt: serverTimestamp()
    });
  } catch (firestoreError) {
    process.exit(1);
  }

  process.exit();
}

createAdminUser();
