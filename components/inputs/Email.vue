<template>
  <v-text-field
    :model-value="modelValue"
    :rules="rules"
    :name="name"
    type="email"
    autocomplete="email"
    :label="label"
    :variant="variant"
    :append-inner-icon="icon ? 'mdi-email' : undefined"
    @update:model-value="$emit('update:model-value', $event)"
  />
</template>
  
<script lang="ts" setup>
withDefaults(defineProps<{
  modelValue?: string,
  label?: string,
  name?: string,
  icon?: boolean,
  variant?: 'filled' | 'outlined' | 'plain' | 'underlined' | 'solo'
}>(), {
  modelValue: undefined,
  label: 'Email',
  name: 'email',
  variant: undefined
})

defineEmits<{(e: 'update:model-value', value: string): void}>()

const rules = [
  (v?: string) => !!v || 'Adresse e-mail requise',
  (v?: string) => (v && /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/.test(v)) || "L'adresse email doit être valide"
]
</script>
  