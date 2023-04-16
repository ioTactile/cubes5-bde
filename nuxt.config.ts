import { ServiceAccount } from 'firebase-admin/app'

const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
}

export default defineNuxtConfig({
  modules: ['nuxt-vuefire'],
  build: { transpile: ['vuetify'] },
  vite: { define: { 'process.env.DEBUG': false } },
  typescript: { shim: false },
  css: ['vuetify/styles', '~/assets/main.scss'],
  vuefire: {
    auth: true,
    config: {
      apiKey: 'AIzaSyCyYv1vujR377lBM2d5z8c2RDXA_Fl8d_0',
      authDomain: 'iotactile.firebaseapp.com',
      projectId: 'iotactile',
      storageBucket: 'iotactile.appspot.com',
      messagingSenderId: '855373712183',
      appId: '1:855373712183:web:55c78efe77bd08905e68b2',
      measurementId: 'G-12178KVRFW'
    },
    admin: { serviceAccount }
  }
})
