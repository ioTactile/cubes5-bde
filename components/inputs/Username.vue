<template>
  <v-text-field
    :model-value="modelValue"
    :rules="rules"
    :name="name"
    type="text"
    :label="label"
    :variant="variant"
    :append-inner-icon="icon ? 'mdi-account' : undefined"
    @update:model-value="$emit('update:model-value', $event)"
  />
</template>

<script lang="ts" setup>
const MIN_LENGTH = 3

withDefaults(defineProps<{
  modelValue?: string,
  label?: string,
  name?: string,
  icon?: boolean,
  variant?: 'filled' | 'outlined' | 'plain' | 'underlined' | 'solo'
}>(), {
  modelValue: undefined,
  label: 'Nom d\'utilisateur',
  name: 'username',
  variant: undefined
})

defineEmits<{(e: 'update:model-value', value: string): void}>()

const rules = [
  (v?: string) => !!v || 'Nom d\'utilisateur requis',
  (v?: string) => (v && v.length >= MIN_LENGTH) || '3 caractères minimum'
]
</script>