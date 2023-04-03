<template>
  <div>
    <v-app-bar color="background" elevation="0" height="80">
      <v-app-bar-nav-icon
        v-if="xs || (admin && adminUser && !mdAndUp)"
        class="mr-md-4"
        @click.stop="drawer = !drawer"
      />
      <v-spacer class="d-block d-sm-none" />
      <NuxtLink to="/" class="text-decoration-none">
        <v-app-bar-title
          class="font-weight-bold text-headline text-sm-h5 text-md-h4 ml-sm-12"
          tag="h1"
        >
          Les délices du campus
        </v-app-bar-title>
      </NuxtLink>
      <v-spacer />
      <div v-if="mdAndUp && !admin">
        <v-btn variant="text" to="/boutique" density="compact">
          Boutique
        </v-btn>
        <v-btn variant="text" to="/a-propos" density="compact">
          À propos
        </v-btn>
        <v-btn variant="text" to="/me-contacter" density="compact">
          Me contacter
        </v-btn>
      </div>
      <div v-if="mdAndUp && admin && adminUser" class="text-center">
        <v-btn variant="text" to="/admin/commandes">
          Commandes
        </v-btn>
        <v-btn variant="text" to="/admin/produits">
          Produits
        </v-btn>
        <v-btn variant="text" to="/admin/stocks">
          Stocks
        </v-btn>
        <v-btn variant="text" to="/admin/statistiques">
          Statistiques
        </v-btn>
        <v-btn variant="text" to="/admin/utilisateurs">
          Utilisateurs
        </v-btn>
      </div>
      <v-btn icon="mdi-account" size="large" @click="isLogin('/profil')" />
      <v-btn
        v-if="!admin"
        icon="mdi-heart"
        size="large"
        :color="wishNumber > 0 ? 'secondary' : ''"
        @click="isLogin('/favoris')"
      />
      <v-btn v-if="!admin" icon="mdi-cart" size="large" @click="isBasket()">
        <v-badge
          :model-value="basketNb > 0"
          :content="basketNb"
          :class="{ 'mr-2': basketNb > 0 }"
        >
          <v-icon icon="mdi-basket" />
        </v-badge>
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" disable-resize-watcher width="250">
      <v-list v-if="!admin" nav class="pa-0">
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
      <v-list v-if="admin && adminUser" nav class="pa-0">
        <v-list-item
          v-for="(item, i) in adminItems"
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

    <v-navigation-drawer
      v-model="basketDrawer"
      disable-resize-watcher
      width="250"
      location="right"
    >
      <h3 color="headline" class="text-center py-4 bg-secondary">
        Panier
      </h3>
      <v-card
        v-for="(product, i) in basket"
        :key="i"
        variant="flat"
        :to="`/boutique/${product.slug}`"
        class="my-0 px-4"
      >
        <v-row no-gutters>
          <v-col cols="3" class="pa-1">
            <v-img :src="product.image?.url" height="80px" />
          </v-col>
          <v-col cols="8" class="pa-1">
            <v-card-title class="text-body-2 pa-0">
              {{ product.name }}
            </v-card-title>
            <v-card-subtitle class="text-body-2 pa-0">
              <span>{{ product.price }} €</span>
              <span class="float-right">{{ product.amount }}</span>
            </v-card-subtitle>
          </v-col>
        </v-row>
        <v-divider v-if="i + 1 < basket.length" />
      </v-card>
      <v-spacer />
      <div class="px-4" :class="!basket.length ? 'mt-4' : ''">
        <span>Sous-total</span>
        <span class="float-right">{{ getBaskeTotal() }} €</span>
        <v-divider class="my-4" color="stroke" />
        <v-btn color="buttonBack" to="/panier" block rounded="0" class="mb-2">
          Voir le panier
        </v-btn>
        <v-btn rounded="0" block color="tertiary" @click="resetBasket">
          Vider le panier
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
import { collection, doc, getDoc, setDoc } from 'firebase/firestore'
import { getIdTokenResult } from 'firebase/auth'
import { useFirestore, useCurrentUser } from 'vuefire'
import { useDisplay } from 'vuetify'
import { LocalProductType, userConverter, productConverter } from '~/stores'
import { useBasketStore } from '~/stores/basket'

type BasketItem = LocalProductType & { amount: number }

const db = useFirestore()
const user = useCurrentUser()
const store = useBasketStore()
const { basket: basketStore } = storeToRefs(store)
const { clearBasket: clearBasketStore } = store
// const { updateBasket: updateBasketStore } = store
const { xs, mdAndUp } = useDisplay()

const login = ref(false)
const adminUser = ref(false)
const wishNumber = ref(0)
const drawer = ref(false)
const basketDrawer = ref(false)
const basket = ref<BasketItem[]>([])

defineProps<{ admin?: boolean }>()

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

const adminItems = [
  {
    title: 'Commandes',
    link: '/admin/commandes'
  },
  {
    title: 'Produits',
    link: '/admin/produits'
  },
  {
    title: 'Stocks',
    link: '/admin/stocks'
  },
  {
    title: 'Statistiques',
    link: '/admin/statistiques'
  },
  {
    title: 'Utilisateurs',
    link: '/admin/utilisateurs'
  }
]

onMounted(async () => {
  if (!user.value) {
    return
  }
  const userRef = doc(db, 'users', user.value.uid).withConverter(userConverter)
  const userDoc = await getDoc(userRef)
  const userFetched = userDoc.data()
  basketStore.value = { ...(userFetched?.basket || {}), ...basketStore.value }
  wishNumber.value = userFetched?.wishList?.length || 0

  const { claims } = await getIdTokenResult(user.value, true)
  adminUser.value = claims.admin
})

const productsRef = collection(db, 'products').withConverter(productConverter)

async function getBasket () {
  const basketPromises = Object.keys(basketStore.value).map(async (key) => {
    const productRef = doc(productsRef, key)
    const productDoc = await getDoc(productRef)
    const product = productDoc.data()
    return {
      ...product,
      amount: basketStore.value[key]
    } as BasketItem
  })
  const basket = await Promise.all(basketPromises)
  return basket
}

const basketItems = await getBasket()
basket.value = basketItems

const basketNb = computed(() => Object.keys(basket.value).length)

const getBaskeTotal = () => {
  const total = basket.value.reduce((acc, item) => {
    return acc + item.price * item.amount
  }, 0)
  return total
}

const resetBasket = async () => {
  if (!user.value) {
    return
  }
  const userRef = doc(db, 'users', user.value.uid).withConverter(userConverter)
  await setDoc(userRef, { basket: {} }, { merge: true })
  clearBasketStore()
}

const isLogin = (path: string) => {
  if (!user.value) {
    login.value = true
  } else {
    navigateTo(path)
  }
}

const isBasket = () => {
  if (!user.value) {
    login.value = true
  } else {
    basketDrawer.value = !basketDrawer.value
  }
}
</script>
