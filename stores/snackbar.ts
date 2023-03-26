import { defineStore } from 'pinia'

export const useSnackbarStore = defineStore('snackbar', () => {
  const content = ref('')
  const color = ref('')

  return { content, color }
})
