<template>
  <v-card
    v-if="product"
    width="200"
    height="320"
    elevation="0"
    rounded="0"
    :to="`/boutique/${product.slug}`"
  >
    <v-img :src="product.image?.url" height="150px" class="mt-2" />
    <h3 class="text-center mx-2 mt-4 text-headline">
      {{ product.name }}
    </h3>
    <v-card-text class="d-flex flex-column align-center text-paragraph">
      <span class="mb-2">Prix: {{ product.price }} €</span>
      <v-icon icon="mdi-heart" :color="isWishListed ? 'secondary' : ''" />
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { doc, getDoc } from 'firebase/firestore'
import { useCurrentUser, useFirestore } from 'vuefire'
import { LocalProductType, userConverter } from '~/stores'

const props = defineProps<{
  product: LocalProductType
}>()

const db = useFirestore()
const user = useCurrentUser()

const isWishListed = ref(false)

onMounted(async () => {
  if (!user.value) { return }

  const userRef = doc(db, 'users', user.value.uid).withConverter(userConverter)
  const userDoc = await getDoc(userRef)
  const userData = userDoc.data()?.wishList
  if (!userData) { return }
  isWishListed.value = userData.includes(props.product.id)
})

</script>
