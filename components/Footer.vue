<template>
  <div>
    <v-footer color="background" class="py-4">
      <v-row justify="center" no-gutters>
        <v-col cols="12" xl="3">
          <span>Boutique</span>
          <NuxtLink v-for="(item, i) in items" :key="i" :to="item.link" class="d-flex text-decoration-none text-paragraph">
            {{ item.title }}
          </NuxtLink>
        </v-col>
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
const items = [
  {
    title: 'Tous les articles',
    link: '/boutique'
  },
  {
    title: 'Politique de la boutique',
    link: '/politique-de-la-boutique'
  },
  {
    title: 'FAQ',
    link: '/faq'
  },
  {
    title: 'Mentions légales',
    link: '/mentions-legales'
  },
  {
    title: 'Politique en matières de cookies',
    link: '/politique-en-matieres-de-cookies'
  },
  {
    title: 'Politique de confidentialité',
    link: '/politique-de-confidentialite'
  },
  {
    title: 'Conditions d\'utilisation',
    link: '/conditions-utilisation'
  }
]
</script>
