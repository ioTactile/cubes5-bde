<template>
  <v-container>
    <v-table
      hover
      fixed-header
      :height="orders.length > 10 ? '60vh' : ''"
    >
      <thead>
        <tr>
          <th>Commande</th>
          <th>Date</th>
          <th>Client</th>
          <th>Etat</th>
          <th>Type</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(order, i) in orders" :key="order.id" :style="`cursor: pointer`" @click="navigateTo(`/admin/commandes/${order.id}`)">
          <td>
            {{ orders.length - i }}
          </td>
          <td>{{ dateFormatter(order.creationDate) }}</td>
          <td>
            {{ orderNames(order) }}
          </td>
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
  </v-container>
</template>

<script lang="ts" setup>
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { useFirestore, useCurrentUser } from 'vuefire'
import { LocalOrderType, orderConverter } from '~/stores'

definePageMeta({ layout: 'admin' })

const db = useFirestore()
const user = useCurrentUser()
const orders = ref<LocalOrderType[]>([])

onMounted(async () => {
  if (!user.value) { navigateTo('/') }
  const ordersRef = collection(db, 'orders').withConverter(orderConverter)
  const ordersQuery = query(ordersRef, orderBy('creationDate', 'desc'))
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
    case 'delivered':
      return 'Livrée'
    case 'canceled':
      return 'Annulée'
    default:
      return 'Inconnu'
  }
}

const orderNames = (order: LocalOrderType) => {
  return (order.userInformations.firstName).charAt(0) + '. ' + order.userInformations.lastName
}
</script>
