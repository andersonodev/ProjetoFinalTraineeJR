import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  base: '/ProjetoFinalTraineeJR/',  // <--- ESSENCIAL! Nome EXATO do repositório
  plugins: [react()],
})
