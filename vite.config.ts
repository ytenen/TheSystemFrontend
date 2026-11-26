import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { resolveApiBaseUrl } from './src/api/apiConfig.ts'

// Fail at build time rather than publishing a bundle that crashes on startup.
export default defineConfig(({ command, mode }) => {
  if (command === 'build') {
    const env = loadEnv(mode, process.cwd(), 'VITE_')
    resolveApiBaseUrl(env.VITE_API_BASE_URL, false)
  }

  return {
    plugins: [react()],
  }
})
