<template>
  <v-app class="overflow-x-hidden">
    <Header admin />
    <v-main class="background ma-4">
      <slot />
    </v-main>
    <Footer />
    <ClientOnly>
      <Snackbar />
    </ClientOnly>
  </v-app>
</template>

<script lang="ts" setup>
// import { getIdTokenResult } from '@firebase/auth'

onBeforeMount(async () => {
  const auth = useFirebaseAuth()!
  await new Promise((resolve) => {
    auth.onAuthStateChanged(async (user) => {
      if (!user) {
        return resolve(await navigateTo('/'))
      }
      // const { claims } = await getIdTokenResult(user, true)
      // if (!claims.admin) { return resolve(await navigateTo('/')) }
      return resolve(null)
    })
  })
})
</script>
