<template>
  <div>
    <v-row class="mx-4">
      <v-col cols="12" md="9">
        <span class="text-headline font-weight-bold pl-1">Mon panier</span>
        <v-divider color="stroke" class="my-2" />
        <v-card v-for="(product, i) in basket" :key="i" rounded="0" flat>
          <div class="d-flex">
            <v-img :src="product.image?.url" height="150px" />
            <div
              class="flex-grow-1 d-flex flex-column justify-space-between pt-2"
            >
              <div class="d-flex flex-column mb-4 ml-4">
                <span class="text-h6 font-weight-bold">{{ product.name }}</span>
                <span class="text-body-2 text-medium-emphasis text-paragraph">{{
                  product.category
                }}</span>
              </div>
              <div class="d-flex align-center justify-space-between">
                <v-btn
                  icon="mdi-delete"
                  variant="flat"
                  @click="updateBasket(product, 0)"
                />
                <InputsQuantity
                  v-model="product.amount"
                  variant="underlined"
                  class="mt-2"
                  @update:model-value="updateBasket(product, $event || 0)"
                />
                <span class="mr-4 my-auto font-weight-bold">{{ product.price * product.amount }} €</span>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <span class="text-headline font-weight-bold pl-1">Récapitulatif</span>
        <v-divider color="stroke" class="my-2" />
        <v-card rounded="0" flat>
          <div class="d-flex flex-column pa-4">
            <div>
              <span>Total HT:</span>
              <span class="float-right">{{ (getBaskeTotal() / 1.2).toFixed(2) }} €</span>
            </div>
            <div class="mt-2">
              <span>TVA:</span>
              <span class="float-right">20 %</span>
            </div>
            <v-divider color="stroke" class="my-4" />
            <div>
              <span>Total:</span>
              <span class="float-right">{{ getBaskeTotal() }} €</span>
            </div>
            <v-btn color="buttonBack" block rounded="0" class="mt-4" @click="dialog=true">
              Paiement
            </v-btn>
            <span class="text-center text-body-2 mt-4"><v-icon size="small" icon="mdi-lock" /> Paiement sécurisé</span>
          </div>
        </v-card>
      </v-col>
    </v-row>
    <v-dialog v-model="dialog" width="450" :persistent="loading">
      <v-card class="pa-2">
        <v-card-title class="text-center text-h5 text-headline">
          Informations de paiement
        </v-card-title>
        <v-card-text>
          <v-form ref="form" @submit.prevent="pay">
            <v-text-field v-model="firstName" label="Prénom" variant="outlined" />
            <v-text-field v-model="lastName" label="Nom" variant="outlined" />
            <span class="d-flex justify-center text-paragraph">Veuillez selectionner un moyen de paiement</span>
            <v-radio-group v-model="methods" inline class="d-flex justify-center mb-4">
              <v-radio label="Carte" value="card" />
              <v-radio label="Espèce" value="cash" />
            </v-radio-group>
            <v-btn color="buttonBack" block type="submit">
              Procéder au paiment
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts" setup>
import { VForm } from 'vuetify/components'
import { loadStripe } from '@stripe/stripe-js'
import { storeToRefs } from 'pinia'
import { collection, doc, getDoc, setDoc, Timestamp, deleteField } from 'firebase/firestore'
import { useFirestore, useCurrentUser } from 'vuefire'
import { useFirebaseFunctions } from '~/composables/useFirebaseFunctions'
import { productConverter, LocalProductType, userConverter } from '~/stores'
import { useBasketStore } from '~/stores/basket'

type BasketItem = LocalProductType & { amount: number }
type createCheckoutSession = {
  sessionId?: string
  orderId?: string
}

const config = useRuntimeConfig()
const functions = useFirebaseFunctions()
const db = useFirestore()
const user = useCurrentUser()
const store = useBasketStore()
const { basket: basketStore } = storeToRefs(store)
const { updateBasket: updateBasketStore } = store

const basket = ref<BasketItem[]>([])
const dialog = ref(false)
const loading = ref(false)
const form = ref<VForm>()
const firstName = ref<string>()
const lastName = ref<string>()
const methods = ref<string>()

const productsRef = collection(db, 'products').withConverter(productConverter)

onMounted(async () => {
  if (!user.value) { return }
  const userRef = doc(db, 'users', user.value.uid).withConverter(userConverter)
  const userDoc = await getDoc(userRef)
  const userData = userDoc.data()
  if (!userData) { return }
  firstName.value = userData.firstName
  lastName.value = userData.lastName
})

const getBasket = async () => {
  const basketPromises = Object.keys(basketStore.value).map(async (key) => {
    const productRef = doc(productsRef, key)
    const productDoc = await getDoc(productRef)
    const product = productDoc.data()
    return {
      ...product,
      amount: basketStore.value[key]
    } as BasketItem
  })
  const basket = await Promise.all(basketPromises)
  return basket
}

const basketItems = await getBasket()
basket.value = basketItems

const getBaskeTotal = () => {
  const total = basket.value.reduce((acc, item) => {
    return acc + item.price * item.amount
  }, 0)
  return total
}

const updateBasket = async (product: BasketItem, newQuantity: number) => {
  if (!user.value) {
    return
  }
  const userRef = doc(db, 'users', user.value.uid).withConverter(userConverter)

  updateBasketStore({
    productId: product.id,
    quantity: newQuantity
  })

  if (newQuantity === 0) {
    await setDoc(
      userRef,
      { basket: { [product.id]: deleteField() } },
      { merge: true }
    )
  } else {
    await setDoc(
      userRef,
      { basket: { [product.id]: newQuantity } },
      { merge: true }
    )
  }

  if (newQuantity === 0) {
    basket.value = basket.value.filter(item => item.id !== product.id)
  }
}

const pay = async () => {
  if (!(await form.value?.validate())?.valid) { return }

  loading.value = true

  if (!user.value) { return }

  const userRef = doc(db, 'users', user.value.uid).withConverter(userConverter)
  await setDoc(userRef, {
    firstName: firstName.value,
    lastName: lastName.value,
    updateDate: Timestamp.now()
  }, { merge: true })

  try {
    const response = await functions<unknown, createCheckoutSession>('createCheckoutSession')({
      basket: basketStore.value,
      firstName: firstName.value,
      lastName: lastName.value,
      email: user.value.email,
      paymentMethod: methods.value
    })

    if (response.data.sessionId) {
      const stripe = await loadStripe(config.public.STRIPE_API_PK)
      if (!stripe) { throw new Error('Erreur fatal') }
      await stripe.redirectToCheckout({ sessionId: response.data.sessionId })
    } else if (response.data.orderId) {
      navigateTo('/success')
    }
  } finally {
    loading.value = false
    dialog.value = false
  }
}

</script>

<style scoped>
.inputs-quantity {
  width: 180px !important;
}
</style>
