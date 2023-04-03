<template>
  <div>
    <v-table
      class="mx-4"
      hover
      fixed-header
      :height="products.length > 13 ? '60vh' : ''"
    >
      <thead>
        <tr>
          <th>Produit</th>
          <th>Nom</th>
          <th>Vente</th>
          <th>C.A. HT</th>
          <th>Favori</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.id">
          <td>
            <v-img :src="product.image?.url" contain height="50" />
          </td>
          <td>{{ product.name }}</td>
          <td>
            {{ product.soldNb || 0 }}
          </td>
          <td>
            {{
              product.soldNb
                ? ((product.soldNb * product.price) / 1.2).toFixed(2)
                : 0
            }}
            €
          </td>
          <td>{{ product.wishListNb || 0 }}</td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

<script lang="ts" setup async>
import { collection, getDocs } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { productConverter } from '~/stores'

definePageMeta({ layout: 'admin' })

const db = useFirestore()

const productsRef = collection(db, 'products').withConverter(productConverter)
const productsDocs = await getDocs(productsRef)
const products = ref(productsDocs.docs.map(doc => doc.data()))
</script>
