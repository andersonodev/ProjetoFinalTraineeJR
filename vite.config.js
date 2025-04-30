import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  base: '/ProjetoFinalTraineeJR/', // Caminho base para produção
  plugins: [react()],
})
