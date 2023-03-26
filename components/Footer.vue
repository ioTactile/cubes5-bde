<template>
  <div>
    <v-footer color="secondary" class="py-4">
      <v-row justify="center" no-gutters>
        <v-btn
          v-for="(link, i) in links"
          :key="i"
          :to="link.link"
          color="buttonBack"
          variant="outlined"
          class="mx-2"
          :size="xs ? 'small' : 'default'"
          rounded="xl"
        >
          {{ link.title }}
        </v-btn>
        <v-col cols="12" class="text-center mt-4">
          © {{ new Date().getFullYear() }} - Réalisé par
          <a href="https://github.com/ioTactile" class="text-decoration-none text-headline">
            <strong>iotactile</strong>
          </a>
        </v-col>
      </v-row>
    </v-footer>
  </div>
</template>

<script lang="ts" setup>
import { useDisplay } from 'vuetify'

const { xs } = useDisplay()

const links = [
  {
    title: 'Page d\'accueil',
    link: '/'
  },
  {
    title: 'À propos',
    link: '/a-propos'
  },
  {
    title: 'Me contacter',
    link: '/me-contacter'
  }
]
</script>
