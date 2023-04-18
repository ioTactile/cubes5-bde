<template>
  <v-snackbar v-model="notification.show" :color="notification.color">
    <div class="text-body-1">
      {{ notification.content }}
    </div>
    <template #actions>
      <v-btn color="stroke" icon="mdi-close" @click="notification.show = false" />
    </template>
  </v-snackbar>
</template>

<script lang="ts" setup>
const { notification } = useNotifier()
</script>
