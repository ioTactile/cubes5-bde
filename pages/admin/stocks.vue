<template>
  <div>
    <v-table
      class="mx-4"
      hover
      fixed-header
      :height="products.length > 9 ? '60vh' : ''"
    >
      <thead>
        <tr>
          <th>Produit</th>
          <th>Nom</th>
          <th>Quantité</th>
          <th>Prix HT</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.id">
          <td>
            <v-img :src="product.image?.url" contain height="50" />
          </td>
          <td>{{ product.name }}</td>
          <td>
            <v-text-field
              v-model="product.quantity"
              variant="outlined"
              hide-details
              class="my-2 pa-0"
            >
              <template #append-inner>
                <v-btn
                  variant="text"
                  icon="mdi-update"
                  @click="updateQuantity(product.id, product.quantity)"
                />
              </template>
            </v-text-field>
          </td>
          <td>{{ (product.price / 1.2).toFixed(2) }} €</td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

<script lang="ts" setup async>
import { collection, getDocs, setDoc, doc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { productConverter } from '~/stores'

definePageMeta({ layout: 'admin' })

const db = useFirestore()

const productsRef = collection(db, 'products').withConverter(productConverter)
const productsDocs = await getDocs(productsRef)
const products = ref(productsDocs.docs.map(doc => doc.data()))

const updateQuantity = async (productId: string, quantityUpdated: number) => {
  const productRef = doc(productsRef, productId)
  await setDoc(
    productRef,
    {
      quantity: quantityUpdated
    },
    { merge: true }
  )
}
</script>

<style scoped>
.v-field__append-inner {
  padding-top: 0 !important;
}
</style>
