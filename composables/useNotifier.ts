type NotifierParams = {
    show: boolean
    content?: string
    color?: string
    error?: any
  }

const notification = reactive<NotifierParams>({
  show: false
})

export const useNotifier = () => {
  const notifier = ({ content, color, error }: Omit<NotifierParams, 'show'>) => {
    notification.color = color || (error ? 'error' : 'info')
    notification.content = content || error || 'Une erreur est survenue'
    notification.show = true

    if (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }

  return { notification, notifier }
}
