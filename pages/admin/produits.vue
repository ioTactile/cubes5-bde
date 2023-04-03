<template>
  <div>
    <v-row>
      <v-col cols="6" sm="5" md="3">
        <v-btn
          color="buttonBack"
          height="56"
          block
          class="mb-16"
          @click="createProduct"
        >
          Ajouter un produit
        </v-btn>
        <v-select
          v-model="sortBy"
          bg-color="headline"
          variant="outlined"
          clearable
          label="Trier par"
          :items="sorting"
        />
        <div class="mt-10">
          <span color="headline" class="text-h5">Filtrer par</span>
          <v-divider class="my-4" />
          <v-expansion-panels>
            <v-expansion-panel bg-color="main" elevation="0">
              <v-expansion-panel-title
                expand-icon="mdi-plus"
                collapse-icon="mdi-minus"
                color="headline"
              >
                Catégories
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-checkbox
                  v-for="(categoryItem, i) in categories"
                  :key="i"
                  v-model="selectedCategory"
                  :value="categoryItem.value"
                  :label="categoryItem.title"
                  hide-details
                  density="compact"
                />
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
          <v-divider class="my-4" />
          <v-expansion-panels>
            <v-expansion-panel bg-color="main" elevation="0">
              <v-expansion-panel-title
                expand-icon="mdi-plus"
                collapse-icon="mdi-minus"
                color="headline"
              >
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
      <v-col cols="6" sm="7" md="9">
        <v-row no-gutters justify="center">
          <v-col
            v-for="productItem in sortedProducts"
            :key="productItem.id"
            class="ma-1 d-flex justify-center"
          >
            <AdminProductTemplate
              :product="productItem"
              @edit="edit(productItem)"
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" width="450" :persistent="loading">
      <v-card>
        <v-form ref="form" @submit.prevent="saveProduct">
          <v-card-title class="d-flex align-center">
            Ajouter un produit
            <v-spacer />
            <v-btn icon="mdi-close" variant="text" @click="reset()" />
          </v-card-title>
          <v-card-text>
            <v-text-field v-model="name" label="Nom" variant="outlined" />
            <InputsNumber
              v-model="price"
              label="Prix"
              variant="outlined"
              append-icon="mdi-currency-eur"
            />
            <InputsQuantity
              v-model="quantity"
              label="Quantité"
              variant="outlined"
            />
            <!-- <InputsImage v-model="image" :product-id="id" /> -->
            <v-file-input
              v-model="image"
              accept="image/png, image/jpeg, image/bmp"
              placeholder="Selectionne une image"
              label="Image"
              show-size
              variant="outlined"
            />
            <v-select
              v-model="category"
              label="Catégorie"
              :items="categories"
              variant="outlined"
            />
            <v-textarea
              v-model="description"
              label="Description"
              variant="outlined"
              auto-grow
            />
          </v-card-text>
          <v-card-actions justify="end" class="mr-2">
            <v-btn variant="text" color="error" @click="deleteProduct">
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
import {
  Timestamp,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore'
import {
  ref as storageRef,
  deleteObject,
  getDownloadURL
} from 'firebase/storage'
import { useFirebaseStorage, useStorageFile } from 'vuefire'
import { VForm } from 'vuetify/components'
import { productConverter, LocalProductType } from '~/stores'

definePageMeta({ layout: 'admin' })

const db = useFirestore()
const storage = useFirebaseStorage()

const dialog = ref(false)
const sortBy = ref<string | null>(null)
const selectedCategory = ref<string | null>(null)
const id = ref<string | null>(null)
const name = ref<string>()
const price = ref<number>()
const quantity = ref<number>()
const description = ref<string>()
const image = ref<File[]>([])
const category = ref<string>()
const loading = ref(false)
const form = ref<VForm>()
const creationDate = ref(new Date(Date.now()))
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
const getProducts = async () => {
  let productsRefQ = query(productsRef)
  if (selectedCategory.value && selectedCategory.value !== 'tout') {
    productsRefQ = query(
      productsRef,
      where('category', '==', selectedCategory.value)
    )
  }
  const products = await getDocs(productsRefQ)
  return products.docs.map(doc => doc.data())
}
const products = ref(await getProducts())

watch([selectedCategory], async () => {
  products.value = await getProducts()
})

const sortedProducts = computed(() => {
  let sorted = [...products.value]
  switch (sortBy.value) {
    // case 'latest':
    //   sorted = sorted.slice().sort((a, b) => b.creationDate - a.creationDate)
    //   break
    case 'quantity':
      sorted = sorted.slice().sort((a, b) => b.quantity - a.quantity)
      break
    case 'nameAsc':
      sorted = sorted.slice().sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'nameDesc':
      sorted = sorted.slice().sort((a, b) => b.name.localeCompare(a.name))
      break
    case 'priceAsc':
      sorted = sorted.slice().sort((a, b) => a.price - b.price)
      break
    case 'priceDesc':
      sorted = sorted.slice().sort((a, b) => b.price - a.price)
      break
    // default:
    //   sorted = sorted.slice().sort((a, b) => b.creationDate - a.creationDate)
    //   break
  }
  return sorted
})

const createProduct = () => {
  id.value = doc(productsRef).id
  dialog.value = true
}

const saveProduct = async () => {
  if (!form.value?.validate() || !id.value) {
    return
  }
  loading.value = true
  try {
    const productRef = doc(productsRef, id.value)
    const fileRef = storageRef(storage, `products/${productRef.id}`)
    const { upload } = useStorageFile(fileRef)
    const data = image.value[0]
    await upload(data)

    await setDoc(productRef, {
      id: id.value,
      name: name.value!,
      description: description.value!,
      price: price.value!,
      quantity: quantity.value!,
      image: {
        name: image.value[0].name,
        url: await getDownloadURL(fileRef)
      },
      category: category.value!,
      slug: slugify(name.value + '-' + productRef.id, { lower: true }),
      soldNb: 0,
      wishListNb: 0,
      creationDate: Timestamp.fromDate(creationDate.value),
      updateDate: Timestamp.now()
    })

    products.value = await getProducts()
  } finally {
    reset()
  }
}

const deleteProduct = async () => {
  loading.value = true
  if (!id.value) {
    return
  }

  try {
    const productRef = doc(productsRef, id.value)
    await deleteDoc(productRef)

    const imageRef = storageRef(storage, `products/${productRef.id}`)
    await deleteObject(imageRef)

    products.value = await getProducts()
  } finally {
    reset()
  }
}

const edit = (productItem: LocalProductType) => {
  id.value = productItem.id
  name.value = productItem.name
  price.value = productItem.price
  quantity.value = productItem.quantity
  description.value = productItem.description
  // image.value = productItem.image
  category.value = productItem.category
  creationDate.value = productItem.creationDate
  dialog.value = true
}

const reset = () => {
  id.value = null
  name.value = ''
  price.value = 0
  quantity.value = 0
  description.value = ''
  image.value = []
  category.value = ''
  creationDate.value = new Date(Date.now())
  loading.value = false
  dialog.value = false
  sortBy.value = null
  selectedCategory.value = null
}
</script>
