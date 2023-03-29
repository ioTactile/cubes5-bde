<template>
  <div>
    <v-row>
      <v-col cols="6" sm="3">
        <v-btn color="buttonBack" height="56" block class="mb-16" @click="createProduct">
          Ajouter un produit
        </v-btn>
        <v-select v-model="sortBy" variant="outlined" clearable label="Trier par" :items="sorting" />
        <div class="mt-10">
          <span color="headline" class="text-h5">Filtrer par</span>
          <v-divider class="my-4" />
          <v-expansion-panels>
            <v-expansion-panel bg-color="main" elevation="0">
              <v-expansion-panel-title expand-icon="mdi-plus" collapse-icon="mdi-minus" color="headline">
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
      <v-col cols="6" sm="9">
        <v-row no-gutters justify="center">
          <v-vol
            v-for="productItem in products"
            :key="productItem.id"
            class="ma-1"
          >
            <AdminProductTemplate :product="productItem" @edit="edit(productItem)" />
          </v-vol>
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
            <InputsNumber v-model="price" label="Prix" variant="outlined" append-icon="mdi-currency-eur" />
            <InputsQuantity v-model="quantity" label="Quantité" variant="outlined" />
            <v-text-field v-model="image" label="Image URL" variant="outlined" />
            <!-- <v-file-input
              v-model="image"
              accept="image/png, image/jpeg, image/bmp"
              placeholder="Selectionne une image"
              label="Image"
              show-size
              variant="outlined"
            /> -->
            <v-select v-model="category" label="Catégorie" :items="categories" variant="outlined" />
            <v-textarea v-model="description" label="Description" variant="outlined" auto-grow />
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
import { Timestamp, collection, doc, getDocs, setDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore'
// import { uploadBytesResumable, getDownloadURL, ref as storageRef, deleteObject } from 'firebase/storage'
// import { useFirebaseStorage } from 'vuefire'
import { VForm } from 'vuetify/components'
import { productConverter, LocalProductType } from '~/stores'

definePageMeta({ layout: 'admin' })

const db = useFirestore()
// const storage = useFirebaseStorage()

const dialog = ref(false)
const sortBy = ref<string|null>(null)
const selectedCategory = ref<string|null>(null)
const id = ref<string|null>(null)
const name = ref<string>()
const price = ref<number>()
const quantity = ref<number>()
const description = ref<string>()
const image = ref<string>()
const category = ref<string>()
const loading = ref(false)
const form = ref<VForm>()
const creationDate = ref(new Date(Date.now()))
const categories = ref([
  { value: 'tout', title: 'Tout' },
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
  let productsRefQ = productsRef
  if (selectedCategory.value && selectedCategory.value !== 'tout') {
    productsRefQ = query(productsRef, where('category', '==', selectedCategory.value))
  } else if (selectedCategory.value === 'tout') {
    productsRefQ = productsRef
  }

  if (sortBy.value === 'priceAsc') {
    productsRefQ = query(productsRef, orderBy('price', 'asc'))
  } else if (sortBy.value === 'priceDesc') {
    productsRefQ = query(productsRef, orderBy('price', 'desc'))
  } else if (sortBy.value === 'quantity') {
    productsRefQ = query(productsRef, orderBy('quantity', 'desc'))
  } else if (sortBy.value === 'nameAsc') {
    productsRefQ = query(productsRef, orderBy('name', 'asc'))
  } else if (sortBy.value === 'nameDesc') {
    productsRefQ = query(productsRef, orderBy('name', 'desc'))
  } else if (sortBy.value === 'latest') {
    productsRefQ = query(productsRef, orderBy('creationDate', 'desc'))
  }

  const products = await getDocs(productsRefQ)
  return products.docs.map(doc => doc.data())
}
const products = ref(await getProducts())

watch([sortBy, selectedCategory], async () => {
  products.value = await getProducts()
})

function createProduct () {
  id.value = doc(productsRef).id
  dialog.value = true
}

async function saveProduct () {
  if (!form.value?.validate() || !id.value) { return }
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
      creationDate: Timestamp.fromDate(creationDate.value),
      updateDate: Timestamp.now()
    })

    // const fileRef = storageRef(storage, `products/${productRef.id}`)
    // const uploadTask = uploadBytesResumable(fileRef, image.value)
    // uploadTask.on('state_changed', (snapshot) => {
    //   const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
    //   console.log('L\'upload est à' + progress + '% completé')
    //   switch (snapshot.state) {
    //     case 'paused':
    //       console.log('L\'upload est en pause')
    //       break
    //     case 'running':
    //       console.log('L\'upload est en cours')
    //       break
    //   }
    // }, (error) => {
    //   switch (error.code) {
    //     case 'storage/unauthorized':
    //       console.log('L\'utilisateur n\'a pas les permissions nécessaires')
    //       break
    //     case 'storage/canceled':
    //       console.log('L\'utilisateur a annulé l\'upload')
    //       break
    //     case 'storage/unknown':
    //       console.log('Une erreur inconnue est survenue')
    //       break
    //   }
    // }, async () => {
    //   const url = await getDownloadURL(uploadTask.snapshot.ref)
    //   await setDoc(productRef, { image: url }, { merge: true })
    // })

    products.value = await getProducts()
  } finally {
    reset()
  }
}

async function deleteProduct () {
  loading.value = true
  if (!id.value) { return }

  try {
    const productRef = doc(productsRef, id.value)
    await deleteDoc(productRef)

    // const imageRef = storageRef(storage, `products/${productRef.id}`)
    // await deleteObject(imageRef)

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
  creationDate.value = productItem.creationDate
  dialog.value = true
}

function reset () {
  id.value = null
  name.value = ''
  price.value = 0
  quantity.value = 0
  description.value = ''
  image.value = ''
  category.value = ''
  creationDate.value = new Date(Date.now())
  loading.value = false
  dialog.value = false
  sortBy.value = null
  selectedCategory.value = null
}
</script>
