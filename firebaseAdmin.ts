import admin from "firebase-admin";
const serviceAccountPath = "./serviceAccountKey.json"; // Certifique-se de que o arquivo JSON está no mesmo diretório

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
  databaseURL: "https://ibmec-jr-solucoes.firebaseio.com", // Substitua pelo URL correto do seu projeto
});

export const auth = admin.auth();
export const db = admin.firestore();

export async function createUser(email: string, senha: string, nome: string) {
  try {
    // Cria o usuário no Firebase Authentication
    const userRecord = await auth.createUser({
      email,
      password: senha,
      displayName: nome,
    });

    // Salva os dados do usuário no Firestore
    await db.collection("users").doc(userRecord.uid).set({
      nome,
      email,
      status: "Ativo",
      advertencias: 0,
      notificacoes: 0,
      dataEntradaEmpresa: new Date().toISOString(),
    });

    return userRecord;
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    throw error;
  }
}
