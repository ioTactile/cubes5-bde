<template>
  <div>
    <v-row>
      <v-col cols="6" sm="3">
        <v-btn color="buttonBack" height="56" block class="mb-16" @click="createProduct">
          Ajouter un produit
        </v-btn>
        <v-select variant="outlined" clearable label="Trier par" :items="sorting" />
        <div class="mt-10">
          <span color="headline" class="text-h5">Filtrer par</span>
          <v-divider class="my-4" />
          <v-expansion-panels>
            <v-expansion-panel bg-color="main" elevation="0">
              <v-expansion-panel-title expand-icon="mdi-plus" collapse-icon="mdi-minus" color="headline">
                Catégories
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-btn variant="text" color="buttonText" block>
                  Tout
                </v-btn>
              </v-expansion-panel-text>
              <v-expansion-panel-text>
                <v-btn variant="text" color="buttonText" block>
                  Bonbons
                </v-btn>
              </v-expansion-panel-text>
              <v-expansion-panel-text>
                <v-btn variant="text" color="buttonText" block>
                  Gâteaux
                </v-btn>
              </v-expansion-panel-text>
              <v-expansion-panel-text>
                <v-btn variant="text" color="buttonText" block>
                  Boisson
                </v-btn>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
          <v-divider class="my-4" />
          <v-expansion-panels>
            <v-expansion-panel bg-color="main" elevation="0">
              <v-expansion-panel-title expand-icon="mdi-plus" collapse-icon="mdi-minus" color="headline">
                Prix
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-range-slider
                  color="buttonText"
                  step="0.1"
                  thumb-label
                  track-size="3"
                  thumb-size="15"
                  :min="1"
                  :max="5"
                />
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>
      </v-col>
      <v-col cols="6" sm="3">
        <v-slide-group class="d-none d-sm-flex" multiple show-arrows>
          <v-slide-group-item
            v-for="product in products"
            :key="product.id"
          >
            <v-card @click="edit(product.id)">
              <v-img :src="product.image" height="200px" />
              <v-card-title class="d-flex align-center">
                <span>{{ product.name }}</span>
                <v-btn icon="mdi-close" variant="text" />
              </v-card-title>
              <v-card-text />
            </v-card>
          </v-slide-group-item>
        </v-slide-group>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" width="450" :persistent="loading">
      <v-card>
        <v-form ref="form" @submit.prevent="saveProduct">
          <v-card-title class="d-flex align-center">
            Ajouter un produit
            <v-spacer />
            <v-btn icon="mdi-close" variant="text" />
          </v-card-title>
          <v-card-text>
            <v-text-field v-model="name" label="Nom" variant="outlined" />
            <InputsNumber v-model="price" label="Prix" variant="outlined" append-icon="mdi-currency-eur" />
            <InputsQuantity v-model="quantity" label="Quantité" variant="outlined" />
            <v-file-input
              v-model="image"
              accept="image/png, image/jpeg, image/bmp"
              placeholder="Selectionne une image"
              label="Image"
              variant="outlined"
            />
            <v-select v-model="category" label="Catégorie" :items="categories" variant="outlined" />
            <v-textarea v-model="description" label="Description" variant="outlined" auto-grow />
          </v-card-text>
          <v-card-actions justify="end" class="mr-2">
            <v-btn variant="text" color="error">
              Supprimer
            </v-btn>
            <v-btn color="buttonBack" variant="outlined" type="submit">
              Ajouter
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts" setup>
import slugify from 'slugify'
import { Timestamp, collection, doc, getDocs, setDoc } from 'firebase/firestore'
import { getDownloadURL, ref as storageRef } from 'firebase/storage'
import { useFirebaseStorage } from 'vuefire'
import { productConverter, LocalProductType } from '~/stores'
import { Image } from '~/functions/src/types'

definePageMeta({ layout: 'admin' })

const db = useFirestore()
const storage = useFirebaseStorage()

const dialog = ref(false)
const id = ref<string|null>(null)
const name = ref<string>()
const price = ref<number>()
const quantity = ref<number>()
const description = ref<string>()
const image = ref<Image>()
const category = ref<string>()
const loading = ref(false)
const form = ref<VForm>()
const date = ref(new Date(Date.now()))
const categories = ref([
  { value: 'bonbons', title: 'Bonbons' },
  { value: 'gateaux', title: 'Gâteaux' },
  { value: 'boisson', title: 'Boisson' }
])
const sorting = ref([
  { value: 'latest', title: 'Plus récent' },
  { value: 'quantity', title: 'Stock' },
  { value: 'nameAsc', title: 'Nom (A-Z)' },
  { value: 'nameDesc', title: 'Nom (Z-A)' },
  { value: 'priceAsc', title: 'Prix (bas à élevé)' },
  { value: 'priceDesc', title: 'Prix (élevé à bas)' }

])

const productsRef = collection(db, 'products').withConverter(productConverter)
async function getProducts () {
  const products = await getDocs(productsRef)
  return products.docs.map(doc => doc.data())
}
const products = ref(await getProducts())

function createProduct () {
  id.value = doc(productsRef).id
  dialog.value = true
}

async function saveProduct () {
  if (!form.value?.validate()) { return }
  loading.value = true
  try {
    const productRef = doc(productsRef, id.value)

    await setDoc(productRef, {
      id: id.value,
      name: name.value,
      price: price.value,
      quantity: quantity.value,
      description: description.value,
      image: image.value,
      category: category.value,
      slug: slugify(name.value + '-' + productRef.id, { lower: true }),
      creationDate: Timestamp.fromDate(date.value),
      updateDate: Timestamp.now()
    })
    const fileRef = storageRef(storage, `products/${productRef.id}`)
    const downloadURL = await getDownloadURL(fileRef)
    window.open(downloadURL, '_blank')?.focus()

    products.value = await getProducts()
  } finally {
    reset()
  }
}

function edit (productItem: LocalProductType) {
  id.value = productItem.id
  name.value = productItem.name
  price.value = productItem.price
  quantity.value = productItem.quantity
  description.value = productItem.description
  image.value = productItem.image
  category.value = productItem.category
  dialog.value = true
}

function reset () {
  id.value = null
  name.value = ''
  price.value = ''
  quantity.value = ''
  description.value = ''
  image.value = undefined
  category.value = ''
  loading.value = false
  dialog.value = false
}
</script>
