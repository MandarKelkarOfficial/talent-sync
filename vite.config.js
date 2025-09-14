/**
 *  @author Mandar K.
 * @date 2025-09-13
 * 
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  server: {
    proxy: {
      // Proxy all requests starting with /api to your backend server
      '/api': {
        target: 'http://localhost:5000', // Your backend server's address
        changeOrigin: true, // Recommended for virtual hosts
      },
    },
  },
})
