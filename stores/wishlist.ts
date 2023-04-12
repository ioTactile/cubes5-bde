import { defineStore } from 'pinia'

export const useWishListStore = defineStore(
  'wishList',
  () => {
    const wishList = ref<string[]>([])

    const updateWishList = ({ productId, inWishList }: {productId: string,
        inWishList: boolean}) => {
      if (inWishList) {
        wishList.value = wishList.value.filter(id => id !== productId)
      } else if (Array.isArray(wishList.value)) {
        wishList.value = [...wishList.value, productId]
      } else {
        wishList.value = [productId]
      }
    }

    return {
      wishList,
      updateWishList
    }
  },
  {
    persist: true
  }
)
