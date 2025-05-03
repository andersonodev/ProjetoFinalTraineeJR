import { createUser } from "./firebaseAdmin";

(async () => {
  try {
    const email = "admin@ibmecjr.com";
    const senha = "admin123";
    const nome = "Admin";

    const user = await createUser(email, senha, nome);
    console.log("Usuário criado com sucesso:", user);
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
  }
})();
