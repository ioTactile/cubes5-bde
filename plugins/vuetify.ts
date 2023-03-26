import '@mdi/font/css/materialdesignicons.css'
import { createVuetify, ThemeDefinition } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const myTheme: ThemeDefinition = {
  dark: false,
  colors: {
    // Illustration
    main: '#f2f7f5', // white
    secondary: '#ffa8ba', // light pink
    tertiary: '#fa5246', // red
    stroke: '#00473e', // dark green
    highlight: '#faae2b', // yellow
    // Elements
    background: '#f2f7f5', // white
    headline: '#00473e', // dark green
    paragraph: '#475d5b', // dark grey
    buttonBack: '#faae2b', // yellow
    buttonText: '#00473e', // dark green
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
