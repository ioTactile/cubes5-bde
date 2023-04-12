<template>
  <v-container v-if="order">
    <v-card rounded="0" elevation="0">
      <v-card-title>
        <h2 class="text-h5 text-center">
          Commande n°{{ order.id }}
        </h2>
      </v-card-title>
      <v-card-text class="text-center">
        <v-row>
          <v-col>
            {{ orderNames }}
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts" setup>
import { doc, getDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { LocalOrderType, orderConverter } from '~/stores'

definePageMeta({ layout: 'admin' })

const db = useFirestore()
const route = useRoute()
const orderNames = ref<string>()
const order = ref<LocalOrderType>()

onMounted(async () => {
  const orderRef = doc(db, 'orders', route.params.id as string).withConverter(orderConverter)
  const orderDoc = await getDoc(orderRef)
  order.value = orderDoc.data()
  if (!order.value) { navigateTo('/profil') }
  orderNames.value = (order.value?.userInformations.firstName) + ' ' + order.value?.userInformations.lastName
})
</script>
