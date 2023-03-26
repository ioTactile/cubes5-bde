import { defineStore } from 'pinia'

export const useBasketStore = defineStore(
  'basket',
  () => {
    const basket = ref<Record<string, number>>({})

    const updateBasket = (productId: string, quantity: number) => {
      basket.value[productId] = quantity
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
