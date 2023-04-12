<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="10">
        <v-img
          src="/main.jpg"
          aspect-ratio="16/9"
          cover
          alt="Main image"
          class="mx-auto mb-4"
        />
        <v-row class="ma-0">
          <v-col
            v-for="product in products"
            :key="product.id"
            class="d-flex justify-center"
          >
            <BoutiqueProductTemplate :product="product" />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup async>
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { productConverter } from '~/stores'

const db = useFirestore()

const productsRef = collection(db, 'products').withConverter(productConverter)
const productsQuery = query(productsRef, orderBy('updateDate', 'desc'), limit(6))
const productsDocs = await getDocs(productsQuery)
const products = productsDocs.docs.map(doc => doc.data())
</script>
