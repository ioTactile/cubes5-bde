// https://nuxt.com/docs/api/configuration/nuxt-config
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
    admin: {
      serviceAccount: {
        projectId: 'cubes5-bde-fbfeb'
      }
    }
  }
  // nitro: {
  //   prerender: {
  //     routes: ['/', 'products', 'products/[id]']
  //   }
  // }
})
