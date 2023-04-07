import { defineStore } from 'pinia'

const removeProperty =
  (dyProps: string) =>
    ({ [dyProps]: _, ...rest }) =>
      rest

export const useBasketStore = defineStore(
  'basket',
  () => {
    const basket = ref<Record<string, number>>({})

    const updateBasket = ({
      productId,
      quantity
    }: {
      productId: string
      quantity: number
    }) => {
      if (!quantity) {
        basket.value = removeProperty(productId)(basket.value)
      } else {
        basket.value = {
          ...basket.value,
          [productId]: quantity
        }
      }
    }

    return {
      basket,
      updateBasket
    }
  },
  {
    persist: true
  }
)
