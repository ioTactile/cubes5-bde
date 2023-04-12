<template>
  <v-container>
    <div class="mb-4">
      <NuxtLink to="/boutique" class="text-decoration-none">
        <span class="text-paragraph"> Retour </span>
      </NuxtLink>
      <span class="text-medium-emphasis"> / {{ product.name }} </span>
      <span>
        <v-btn variant="text" :loading="loading" icon="mdi-heart" :color="isWishListed ? 'secondary' : ''" @click="addToWishList" />
      </span>
    </div>
    <v-row>
      <v-col cols="12" sm="6">
        <v-img :src="product.image?.url" />
      </v-col>
      <v-col cols="12" sm="6">
        <div class="mb-4">
          <h3 class="text-headline text-h4 font-weight-bold mb-2">
            {{ product.name }}
          </h3>
          <span
            class="text-paragraph text-subtitle-1 text text-medium-emphasis"
          >{{ product.category }}</span>
        </div>
        <span class="text-h6 text-paragraph">Prix: {{ product.price }} €</span>
        <div class="mt-12">
          <InputsQuantity v-model="quantity" variant="underlined" />
          <v-btn
            color="white"
            block
            rounded="0"
            class="mb-4"
            @click="addToCart"
          >
            {{ inBasket ? 'Modifier' : 'Ajouter' }}
          </v-btn>
          <v-btn color="buttonBack" block rounded="0">
            Commander et payer
          </v-btn>
        </div>
        <div class="mt-12">
          <v-btn
            variant="text"
            block
            @click="descriptionDetails = !descriptionDetails"
          >
            <span class="d-flex align-center">Détails du produit
              <v-icon
                class="ml-2"
                :icon="descriptionDetails ? 'mdi-minus' : 'mdi-plus'"
                size="small"
              /></span>
          </v-btn>
          <p v-if="descriptionDetails" class="mt-4">
            {{ product.description }}
          </p>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup async>
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  limit,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore'
import { storeToRefs } from 'pinia'
import { useCurrentUser, useFirestore } from 'vuefire'
import { useBasketStore } from '~/stores/basket'
import { useWishListStore } from '~/stores/wishList'
import { productConverter, userConverter } from '~/stores'

const user = useCurrentUser()
const db = useFirestore()
const route = useRoute()
const basketStoreRef = useBasketStore()
const wishlistStoreRef = useWishListStore()
const { basket } = storeToRefs(basketStoreRef)
const { updateBasket: updateBasketStore } = basketStoreRef
const { updateWishList: updateWishListStore } = wishlistStoreRef

const productsRef = collection(db, 'products').withConverter(productConverter)
const productQuery = query(
  productsRef,
  where('slug', '==', route.params.id),
  limit(1)
)
const productDoc = (await getDocs(productQuery)).docs[0]
const product = productDoc.data()

const quantity = ref(1)
const descriptionDetails = ref(false)
const loading = ref(false)
const isWishListed = ref(false)

onMounted(async () => {
  if (!user.value) { return }

  const userRef = doc(db, 'users', user.value.uid).withConverter(userConverter)
  const userDoc = await getDoc(userRef)
  const userData = userDoc.data()?.wishList
  if (!userData) { return }
  isWishListed.value = userData.includes(product.id)
})

const inBasket = computed(() => basket.value[product.id])

watch(inBasket, value => (quantity.value = value))

const addToCart = async () => {
  loading.value = true

  updateBasketStore({
    productId: product.id,
    quantity: quantity.value
  })

  if (!user.value) { return }

  try {
    const userRef = doc(db, 'users', user.value.uid).withConverter(userConverter)
    await setDoc(
      userRef,
      { basket: { [product.id]: quantity.value } },
      { merge: true }
    )
  } finally {
    loading.value = false
  }
}

const addToWishList = async () => {
  loading.value = true

  updateWishListStore({
    productId: product.id,
    inWishList: isWishListed.value
  })

  if (!user.value) { return }

  try {
    const userRef = doc(db, 'users', user.value.uid).withConverter(userConverter)
    if (!isWishListed.value) {
      await setDoc(userRef, {
        wishList: arrayUnion(product.id)
      }, { merge: true })
      isWishListed.value = true
    } else {
      await setDoc(userRef, {
        wishList: arrayRemove(product.id)
      }, { merge: true })
      isWishListed.value = false
    }
  } finally {
    loading.value = false
  }
}
</script>
