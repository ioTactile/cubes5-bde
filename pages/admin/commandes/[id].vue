<template>
  <v-container v-if="order">
    <v-card rounded="0" elevation="0">
      <v-card-title class="d-flex flex-column justify-center align-center">
        <span class="text-subtitle-1 text-md-h6 mb-4 d-inline-block text-truncate text-long">
          Commande n°{{ order.id }}
        </span>
        <span class="text-subtitle-1 text-md-h6 mb-2">
          Commande de {{ orderNames }}
        </span>
        <span class="text-subtitle-1 text-md-h6">
          Du {{ dateFormatter(order.creationDate) }}
        </span>
      </v-card-title>
      <v-card-text class="text-center">
        <v-row>
          <v-col cols="12">
            <v-table
              hover
              fixed-header
              :height="order.products.length > 9 ? '60vh' : ''"
            >
              <thead class="text-subtitle-1 text-md-h6">
                <tr>
                  <th class="text-center">
                    Produit
                  </th>
                  <th class="text-center">
                    Quantité
                  </th>
                </tr>
              </thead>
              <tbody class="text-subtitle-1 text-md-h6">
                <tr v-for="product in order.products" :key="product.id">
                  <td>
                    <v-img :src="product.image?.url" height="120" />
                  </td>
                  <td>{{ product.quantity }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions :class="smAndUp ? 'd-flex justify-center' : ''">
        <v-btn variant="elevated" :loading="loading" color="tertiary" :block="!smAndUp" @click="open">
          Confirmer la réception
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-dialog v-model="dialog" width="450">
      <v-card width="450">
        <v-card-title class="text-h6 d-flex align-center">
          <span>Confirmer la réception de la commande</span>
          <v-btn icon class="ml-auto" variant="text" @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-actions class="d-flex justify-center">
          <v-btn
            variant="elevated"
            :loading="loading"
            color="tertiary"
            @click="confirm"
          >
            Confirmer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts" setup>
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { getStorage, ref as storageRef, deleteObject } from 'firebase/storage'
import { useFirestore } from 'vuefire'
import { useDisplay } from 'vuetify'
import { LocalOrderType, orderConverter } from '~/stores'

definePageMeta({ layout: 'admin' })

const { smAndUp } = useDisplay()

const db = useFirestore()
const route = useRoute()

const orderNames = ref<string>()
const order = ref<LocalOrderType>()
const loading = ref(false)
const dialog = ref(false)

const orderRef = doc(db, 'orders', route.params.id as string).withConverter(
  orderConverter
)

onMounted(async () => {
  const orderDoc = await getDoc(orderRef)
  order.value = orderDoc.data()
  if (!order.value) {
    navigateTo('/profil')
  }
  orderNames.value =
    order.value?.userInformations.firstName +
    ' ' +
    order.value?.userInformations.lastName
})

const open = () => {
  dialog.value = true
}

const confirm = async () => {
  loading.value = true

  try {
    const storage = getStorage()
    const fileRef = storageRef(storage, `orders/${order.value?.id}`)
    await deleteObject(fileRef)

    await setDoc(orderRef, {
      status: 'collected'
    }, { merge: true })
  } finally {
    loading.value = false
    dialog.value = false
    navigateTo('/admin/commandes')
  }
}

const dateFormatter = new Intl.DateTimeFormat('fr', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
}).format
</script>

<style scoped>
.text-long {
  max-width: 100%;
}
</style>
