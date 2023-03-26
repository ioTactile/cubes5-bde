import '@mdi/font/css/materialdesignicons.css'
import { createVuetify, ThemeDefinition } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const myTheme: ThemeDefinition = {
  dark: false,
  colors: {
    // Illustration
    main: '#fffffe', // white
    secondary: '#e3f6f5', // light blue
    tertiary: '#bae8e8', // light blue
    stroke: '#272343', // dark blue
    highlight: '#ffd803', // yellow
    // Elements
    background: '#fffffe', // white
    headline: '#272343', // dark blue
    paragraph: '#2d334a', // dark grey
    buttonBack: '#ffd803', // yellow
    buttonText: '#272343', // dark blue
    // Events
    error: '#ed4337', // red
    success: '#4caf50' // green
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    ssr: true,
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: { mdi }
    },
    theme: {
      defaultTheme: 'myTheme',
      themes: { myTheme }
    },
    components,
    directives
  })

  nuxtApp.vueApp.use(vuetify)
})
