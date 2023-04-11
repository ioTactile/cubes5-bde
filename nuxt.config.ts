import { ServiceAccount } from 'firebase-admin/app'

const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
}

export default defineNuxtConfig({
  modules: ['@pinia/nuxt', '@pinia-plugin-persistedstate/nuxt', 'nuxt-vuefire'],
  build: { transpile: ['vuetify'] },
  vite: { define: { 'process.env.DEBUG': false } },
  typescript: { shim: false },
  css: ['vuetify/styles', '~/assets/main.scss'],
  vuefire: {
    auth: true,
    config: {
      apiKey: 'AIzaSyCo5sgUcCclEEJStyapLRpYpVhMHY_nk6Y',
      authDomain: 'cubes5-bde-fbfeb.firebaseapp.com',
      projectId: 'cubes5-bde-fbfeb',
      storageBucket: 'cubes5-bde-fbfeb.appspot.com',
      messagingSenderId: '775663924437',
      appId: '1:775663924437:web:35a370c5511919bc4fde5c',
      measurementId: 'G-420TF53Z71'
    },
    admin: { serviceAccount }
  },
  runtimeConfig: {
    public: {
      STRIPE_API_PK: 'pk_test_51MuGAEEIYaTCTNVJL0ofelSgKqOCcCrfCzgxWA5SFNbjwwPdABhTj4arg41HYYbw0iBMIZmFnCVasxeLtYhIXMrB00bFytXDaZ'
    }
  }
})
