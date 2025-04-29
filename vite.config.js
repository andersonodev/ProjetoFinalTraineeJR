import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc'; // <- Corrigido!

export default defineConfig({
  base: '/ProjetoFinalTraineeJR/',  // <-- Nome do repositório aqui
  plugins: [react()],
});
