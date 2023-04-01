<template>
  <div>
    <v-footer color="background" class="py-4">
      <v-row>
        <v-col cols="12" sm="6" md="3" :class="{ 'text-center': !mdAndUp }">
          <h4 class="text-buttonText">
            Boutique
          </h4>
          <v-divider class="my-2" :style="!mdAndUp ? 'margin: 0 auto' : ''" :length="!mdAndUp ? '40%' : '70%'" />
          <NuxtLink v-for="(item, i) in items" :key="i" :to="item.link" class="d-flex justify-center justify-md-start text-decoration-none text-paragraph">
            {{ item.title }}
          </NuxtLink>
        </v-col>
        <v-col cols="12" sm="6" md="3" :class="{ 'text-center': !mdAndUp }">
          <h4 class="text-buttonText">
            Adresse
          </h4>
          <v-divider class="my-2" :style="!mdAndUp ? 'margin: 0 auto' : ''" :length="!mdAndUp ? '40%' : '70%'" />
          <p>
            7 bis Av. Robert Schuman<br>
            51100 Reims, France
          </p>
        </v-col>
        <v-col cols="12" sm="6" md="3" :class="{ 'text-center': !mdAndUp }">
          <h4 class="text-buttonText">
            Horaires d'ouverture
          </h4>
          <v-divider class="my-2" :style="!mdAndUp ? 'margin: 0 auto' : ''" :length="!mdAndUp ? '40%' : '70%'" />
          <p>
            Matin: 10h30 - 10h45<br>
            Après-midi: 15h30 - 15h45<br><br>
            Jeudi après-midi fermé
          </p>
        </v-col>
        <v-col cols="12" sm="6" md="3" :class="{ 'text-center': !mdAndUp }">
          <h4 class="text-buttonText">
            Restez à jour
          </h4>
          <v-divider class="my-2" :style="!mdAndUp ? 'margin: 0 auto' : ''" :length="!mdAndUp ? '40%' : '70%'" />
          <v-text-field
            outlined
            dense
            placeholder="Votre adresse email"
            class="mt-2"
          />
          <v-btn
            color="buttonBack"
            block
          >
            S'abonner
          </v-btn>
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
import { useDisplay } from 'vuetify'

const { mdAndUp } = useDisplay()

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
