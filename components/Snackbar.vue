<template>
  <v-snackbar v-model="show" :color="color">
    <div class="text-body-1">
      {{ message }}
    </div>
    <template #actions>
      <v-btn color="stroke" icon="mdi-close" @click="show = false" />
    </template>
  </v-snackbar>
</template>

<script lang="ts" setup>
import { useSnackbarStore } from '~/stores/snackbar'

const show = ref(false)
const message = ref('')
const color = ref('')

const snackbarStore = useSnackbarStore()
snackbarStore.$subscribe((_, state) => {
  message.value = state.content
  color.value = state.color
  show.value = true
})
</script>
