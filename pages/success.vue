<template>
  <v-container
    class="text-center bg-main text-headline h-100 py-16"
  >
    <div class="text-h3">
      Merci pour votre commande
    </div>
  </v-container>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { doc, updateDoc, deleteField } from '@firebase/firestore'
import { useFirestore, useCurrentUser } from 'vuefire'
import { useBasketStore } from '~/stores/basket'
import { userConverter } from '~/stores'

const db = useFirestore()
const user = useCurrentUser()
const store = useBasketStore()
const { basket } = storeToRefs(store)

onMounted(async () => {
  basket.value = {}

  if (!user.value) { return }
  const basketRef = doc(db, 'users', user.value.uid).withConverter(userConverter)
  await updateDoc(basketRef, { basket: deleteField() })
})
</script>
