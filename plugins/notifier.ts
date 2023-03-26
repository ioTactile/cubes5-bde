import { useSnackbarStore } from '@/stores/snackbar'

type NotifierParams = {
  content?: string
  color?: string
  error?: any
}

export default defineNuxtPlugin(() => {
  const notifier = (notifierParam: NotifierParams) => {
    const { content, color, error } = notifierParam

    const snackbarStore = useSnackbarStore()
    snackbarStore.$patch({
      color: color || (error ? 'stroke' : 'buttonBack'),
      content: content || error || 'Une erreur est survenue'
    })

    if (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }
  return { provide: { notifier } }
})
