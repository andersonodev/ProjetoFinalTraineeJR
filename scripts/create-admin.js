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
    console.log("✅ Usuário criado com sucesso.");
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.warn("⚠️ Email já está em uso. Tentando fazer login para recuperar UID...");
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        uid = userCredential.user.uid;
        console.log("✅ Login bem-sucedido. UID recuperado.");
      } catch (loginError) {
        console.error("❌ Não foi possível logar com o email existente:", loginError.message);
        process.exit(1);
      }
    } else {
      console.error("❌ Erro inesperado ao criar usuário:", error.message);
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
    console.log("✅ Documento do administrador criado/atualizado com sucesso no Firestore.");
  } catch (firestoreError) {
    console.error("❌ Erro ao criar documento no Firestore:", firestoreError.message);
  }

  process.exit();
}

createAdminUser();
