<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h2 class="text-center text-h4 font-weight-bold text-headline mb-12">
          Boutique
        </h2>
      </v-col>
      <v-col cols="12" sm="5" md="3">
        <v-select
          v-if="!mdAndUp"
          v-model="sortBy"
          bg-color="headline"
          variant="outlined"
          clearable
          label="Trier par"
          :items="sorting"
          class="mb-10"
        />
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
                v-model="priceRange"
                color="buttonText"
                step="0.1"
                track-size="3"
                thumb-size="15"
                :min="0"
                :max="5"
                class="ma-0"
              >
                <template #prepend>
                  <v-text-field
                    :model-value="priceRange[0]"
                    hide-details
                    single-line
                    type="number"
                    variant="outlined"
                    density="compact"
                    :style="`width: 70px`"
                    @change="$set(priceRange, 0, $event)"
                  />
                </template>
                <template #append>
                  <v-text-field
                    :model-value="priceRange[1]"
                    hide-details
                    single-line
                    type="number"
                    variant="outlined"
                    :style="`width: 70px`"
                    density="compact"
                    @change="$set(priceRange, 1, $event)"
                  />
                </template>
              </v-range-slider>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
      <v-col cols="12" sm="7" md="9">
        <v-row no-gutters>
          <v-col v-if="mdAndUp" cols="9" />
          <v-col v-if="mdAndUp" cols="3" align-self="end">
            <v-select
              v-model="sortBy"
              bg-color="headline"
              variant="outlined"
              clearable
              label="Trier par"
              :items="sorting"
            />
          </v-col>
          <v-col
            v-for="product in filteredProducts"
            :key="product.id"
            align-self="center"
            class="ma-1 d-flex justify-center"
          >
            <boutique-product-template :product="product" />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { collection, getDocs, query, where } from 'firebase/firestore'
import { useDisplay } from 'vuetify'
import { useFirestore } from 'vuefire'
import { productConverter } from '~/stores'

const db = useFirestore()
const { mdAndUp } = useDisplay()

const sortBy = ref<string | null>(null)
const selectedCategory = ref<string | null>(null)
const priceRange = ref<number[]>([0, 5])
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
    case 'latest':
      sorted = sorted.sort((a, b) => Date.parse(b.creationDate.toString()) - Date.parse(a.creationDate.toString()))
      break
    case 'quantity':
      sorted = sorted.sort((a, b) => b.quantity - a.quantity)
      break
    case 'nameAsc':
      sorted = sorted.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'nameDesc':
      sorted = sorted.sort((a, b) => b.name.localeCompare(a.name))
      break
    case 'priceAsc':
      sorted = sorted.sort((a, b) => a.price - b.price)
      break
    case 'priceDesc':
      sorted = sorted.sort((a, b) => b.price - a.price)
      break
    default:
      sorted = sorted.sort((a, b) => Date.parse(b.creationDate.toString()) - Date.parse(a.creationDate.toString()))
      break
  }
  return sorted
})

const filteredProducts = computed(() => {
  return sortedProducts.value.filter(
    product => product.price >= priceRange.value[0] && product.price <= priceRange.value[1]
  )
})
</script>
