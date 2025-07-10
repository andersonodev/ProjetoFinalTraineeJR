import { createUser } from "./firebaseAdmin";

(async () => {
  try {
    const email = "admin@ibmecjr.com";
    const senha = "admin123";
    const nome = "Admin";

    const user = await createUser(email, senha, nome);
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
  }
})();
