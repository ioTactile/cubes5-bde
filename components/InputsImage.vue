<template>
  <div>
    <v-input-file
      v-model="image"
      accept="image/png, image/jpeg, image/bmp"
      placeholder="Selectionne une image"
      label="Image"
      show-size
      variant="outlined"
    />
    <v-img v-if="image" :src="image[0]?.url" />
  </div>
</template>

<script lang="ts" setup>
import {
  ref as storageRef,
  getDownloadURL
} from 'firebase/storage'
import { useStorageFile, useFirebaseStorage } from 'vuefire'

const storage = useFirebaseStorage()

type dbFile = {
  name: string,
  url: string,
  file?: File,
}

type toUpFile = Omit<dbFile, 'ref'> & { file: File }

defineProps<{
  modelValue?: dbFile[]|dbFile,
  productId: string,
}>()

const image = ref<dbFile[]>([])
const toUpload = ref<toUpFile[]>([])

const uploadImage = (file: toUpFile) => {
  Promise<dbFile>(async (resolve) => {
    const fileRef = storageRef(storage, `products/${productId}`)
    const { upload } = useStorageFile(fileRef)
    const data = file.value
    await upload(data)
    resolve({
      name: file.name,
      url: await getDownloadURL(fileRef)
    })
  })
}

const saveImage = async () => {
  const images = await Promise.all(toUpload.value.map(uploadImage))
  image.value = [...image.value, ...images]
  toUpload.value = []
}

defineExpose({ saveImage })
</script>
