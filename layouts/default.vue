<template>
  <v-app class="overflow-x-hidden">
    <Header />
    <v-main class="background">
      <slot />
    </v-main>
    <Footer />
    <ClientOnly>
      <Snackbar />
    </ClientOnly>
  </v-app>
</template>
