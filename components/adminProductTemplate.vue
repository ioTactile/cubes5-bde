<template>
  <v-card
    v-if="product"
    width="200"
    height="320"
    elevation="0"
    rounded="0"
    @click="emits('edit')"
  >
    <v-img :src="product.image?.url" height="150px" class="mt-2" />
    <h3 class="text-center mx-2 mt-4 text-headline">
      {{ product.name }}
    </h3>
    <v-card-text class="d-flex flex-column align-center text-paragraph">
      <span class="mb-4">Stock: {{ product.quantity }}</span>
      <span>Prix: {{ product.price }} € TTC</span>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { LocalProductType } from '~/stores'

defineProps<{
  product: LocalProductType
}>()

const emits = defineEmits<{(e: 'edit'): void }>()
</script>
