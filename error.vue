<template>
  <v-app id="inspire">
    <v-main>
      <v-container fill-height fluid>
        <div class="text-center text-buttonBack">
          <h1 v-if="props.error.statusCode === 404">
            Erreur {{ props.error.statusCode }}
          </h1>
          <h2>Une erreur est survenue lors du chargement de la page</h2>
          <v-btn
            :variant="btnOutlined ? 'outlined' : undefined"
            color="buttonBack"
            to="/"
            class="mt-5"
            @mouseover="btnOutlined = false"
            @mouseleave="btnOutlined = true"
          >
            Retour à l'accueil
          </v-btn>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
const props = defineProps<{
  error: {
    statusCode: number,
    statusMessage: string,
  }
}>()

const btnOutlined = ref(true)

// eslint-disable-next-line no-console
console.error(props)

useHead({
  title: props.error.statusCode === 404 ? 'Page introuvable' : 'Une erreur est survenue'
})
</script>

