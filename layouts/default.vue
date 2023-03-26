<template>
  <v-app class="overflow-x-hidden">
    <Header />
    <v-main class="background ma-4">
      <slot />
    </v-main>
    <Footer />
    <ClientOnly>
      <Snackbar />
    </ClientOnly>
  </v-app>
</template>
