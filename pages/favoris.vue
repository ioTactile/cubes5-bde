<template>
  <v-container>
    <v-row>
      <v-col v-if="!products.length" class="text-center">
        Vous n'avez pas encore de produits dans votre liste de souhaits.
      </v-col>
      <v-col
        v-for="product in products"
        v-else
        :key="product.id"
        align-self="center"
        class="ma-1 d-flex justify-center"
      >
        <BoutiqueProductTemplate :product="product" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup async>
import { collection, doc, query, where, getDocs, getDoc } from 'firebase/firestore'
import { useCurrentUser, useFirestore } from 'vuefire'
import { LocalProductType, productConverter, userConverter } from '~/stores'

const db = useFirestore()
const user = useCurrentUser()

const products = ref<LocalProductType[]>([])

onMounted(async () => {
  if (!user.value) { return }
  const userRef = doc(db, 'users', user.value.uid).withConverter(userConverter)
  const userDoc = await getDoc(userRef)
  const wishList = userDoc.data()?.wishList
  if (!wishList?.length) { return }

  const productsRef = collection(db, 'products').withConverter(productConverter)
  const productsQuery = query(productsRef, where('id', 'in', wishList))
  const productsDocs = await getDocs(productsQuery)
  products.value = productsDocs.docs.map(doc => doc.data())
})

</script>
