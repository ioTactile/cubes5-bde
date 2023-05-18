<template>
  <div>
    <v-table
      class="mx-4"
      hover
      fixed-header
      :height="orders.length > 10 ? '60vh' : ''"
    >
      <thead>
        <tr>
          <th>Commande</th>
          <th>Date</th>
          <th>Etat</th>
          <th>Type</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(order, i) in orders" :key="order.id" :style="`cursor: pointer`" @click="openOrder(order.id)">
          <td>
            {{ orders.length - i }}
          </td>
          <td>{{ dateFormatter(order.creationDate) }}</td>
          <td>
            {{ orderStatus(order.status) }}
          </td>
          <td>
            {{ order.methods === 'cash' ? 'En espèce' : 'Par carte' }}
          </td>
          <td>
            {{
              TotalOrderProductsPrice(order)
            }}
            €
          </td>
        </tr>
      </tbody>
    </v-table>

    <v-dialog v-model="orderDialog" width="400">
      <v-card class="d-flex justify-center align-center">
        <v-img :src="orderUrl" cover width="400" height="400" />
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts" setup>
import { collection, getDocs, where, orderBy, query } from 'firebase/firestore'
import { useFirestore, useCurrentUser } from 'vuefire'
import { LocalOrderType, orderConverter } from '~/stores'

const { notifier } = useNotifier()
const db = useFirestore()
const user = useCurrentUser()
const orders = ref<LocalOrderType[]>([])

const orderDialog = ref(false)
const orderUrl = ref('')

onMounted(async () => {
  if (!user.value) { navigateTo('/') }
  const ordersRef = collection(db, 'orders').withConverter(orderConverter)
  const ordersQuery = query(ordersRef, where('userId', '==', user.value?.uid as string), orderBy('creationDate', 'desc'))
  const ordersDocs = await getDocs(ordersQuery)
  orders.value = ordersDocs.docs.map(doc => doc.data())
})

const TotalOrderProductsPrice = (order: LocalOrderType) => {
  let total = 0
  order.products.forEach((product) => {
    total += product.price * product.quantity
  })
  return total
}

const openOrder = (id: string) => {
  orderDialog.value = true

  const order = orders.value.find(order => order.id === id)
  if (!order) { return }
  if (order.status === 'collected') {
    orderDialog.value = false
    notifier({ content: 'Commande déjà récupérée', color: 'error' })
    return
  }
  orderUrl.value = order.qrCodeUrl!
}

const dateFormatter = new Intl.DateTimeFormat('fr', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
}).format

const orderStatus = (status: string) => {
  switch (status) {
    case 'pending':
      return 'En attente de paiement'
    case 'paid':
      return 'Payée'
    case 'collected':
      return 'Livrée'
    case 'canceled':
      return 'Annulée'
    default:
      return 'Inconnu'
  }
}
</script>
