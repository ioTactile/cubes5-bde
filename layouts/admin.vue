<template>
  <v-app class="overflow-x-hidden">
    <Header admin />
    <v-main class="background">
      <slot />
    </v-main>
    <Footer />
    <ClientOnly>
      <Snackbar />
    </ClientOnly>
  </v-app>
</template>

<script lang="ts" setup>
import { useCurrentUser } from 'vuefire'

const user = useCurrentUser()

onBeforeMount(async () => {
  if (!user.value) { return await navigateTo('/') }
})
</script>
