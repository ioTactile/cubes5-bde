<template>
  <div>
    <v-app-bar color="background" elevation="0" height="80">
      <v-app-bar-nav-icon v-if="xs" class="mr-4" @click.stop="drawer = !drawer" />
      <v-spacer class="d-block d-sm-none" />
      <NuxtLink to="/" class="text-decoration-none">
        <v-app-bar-title class="font-weight-bold text-headline text-h4 ml-sm-12" tag="h1">
          Les délices du campus
        </v-app-bar-title>
      </NuxtLink>
      <v-spacer />
      <v-btn variant="text" size="large" to="/boutique" density="compact">
        Boutique
      </v-btn>
      <v-btn variant="text" size="large" to="/a-propos" density="compact">
        À propos
      </v-btn>
      <v-btn variant="text" size="large" to="/me-contacter" density="compact">
        Me contacter
      </v-btn>
      <v-btn icon="mdi-account" size="large" @click="isLogin('/profil')" />
      <v-btn icon="mdi-heart" size="large" :color="wishNumber > 0 ? 'secondary' : ''" @click="isLogin('/favoris')" />
      <v-btn icon="mdi-cart" size="large" @click="isBasket()" />
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" width="200">
      <v-list nav class="pa-0">
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :value="item"
          :to="item.link"
          active-color="paragraph"
          class="text-center"
        >
          {{ item.title }}
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-navigation-drawer v-model="basketDrawer" width="200" location="right">
      <h3 color="headline" class="text-center py-4 bg-secondary">
        Panier
      </h3>
      <v-spacer />
      <div class="px-4">
        <span>Sous-total</span>
        <span class="float-right">0,00 €</span>
        <v-divider class="my-4" color="stroke" />
        <v-btn color="buttonBack" to="/panier">
          Voir le panier
        </v-btn>
      </div>
    </v-navigation-drawer>

    <client-only>
      <Connexion v-model="login" />
    </client-only>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { doc } from 'firebase/firestore'
import { useFirestore, useCurrentUser, useDocument } from 'vuefire'
import { useDisplay } from 'vuetify'
import { useBasketStore } from '~/stores/basket'

const db = useFirestore()
const basketStore = useBasketStore()
const { basket } = storeToRefs(basketStore)
const { xs } = useDisplay()

const login = ref(false)
const adminUser = ref(false)
const wishNumber = ref(0)
const drawer = ref(false)
const basketDrawer = ref(false)

defineProps<{admin?: boolean}>()

const items = [
  {
    title: 'Boutique',
    link: '/boutique'
  },
  {
    title: 'À propos',
    link: '/a-propos'
  },
  {
    title: 'Contact',
    link: '/contact'
  }
]

onMounted(() => {
  const auth = useFirebaseAuth()!
  auth.onAuthStateChanged(async (user) => {
    if (!user) { return }
    const userFetched = useDocument(doc(db, 'users', user.uid).withConverter(userConverter))
    if (userFetched.value) {
      basket.value = { ...(userFetched.value.basket || {}), ...basket.value }
      wishNumber.value = userFetched.value.wishList?.length || 0
    }
    const { claims } = await getIdTokenResult(user, true)
    adminUser.value = claims.admin
  })
})

const isLogin = (path: string) => {
  const user = useCurrentUser()
  if (!user.value) {
    login.value = true
  } else {
    navigateTo(path)
  }
}

const isBasket = () => {
  const user = useCurrentUser()
  if (!user.value) {
    login.value = true
  } else {
    basketDrawer.value = !basketDrawer.value
  }
}
</script>
