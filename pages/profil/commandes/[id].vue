<template>
  <v-container>
    <div class="d-flex justify-center align-center">
      <v-img :src="order" cover />
    </div>
  </v-container>
</template>

<script lang="ts" setup async>
import { doc, getDoc } from 'firebase/firestore'

const db = useFirestore()
const route = useRoute()

const orderRef = doc(db, 'orders', route.params.id as string)
const orderDoc = await getDoc(orderRef)
const order = orderDoc.data()?.qrCodeUrl
</script>
