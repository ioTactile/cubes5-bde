<template>
  <v-row align="center" justify="center" no-gutters>
    <v-col cols="12">
      <v-text-field
        v-model="password"
        :append-inner-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
        :rules="rules"
        :type="show ? 'text' : 'password'"
        label="Mot de passe"
        :variant="variant"
        name="password"
        :class="inputClass"
        autocomplete="new-password"
        @click:append-inner="show = !show"
        @update:model-value="$emit('update:model-value', $event)"
      />
    </v-col>
    <v-col cols="12">
      <v-text-field
        v-model="passwordConfirm"
        :append-inner-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'"
        :rules="[
          (v) => v === password || 'Les mots de passe doivent être similaire',
          ...rules,
        ]"
        :type="show2 ? 'text' : 'password'"
        label="Confirmer le mot de passe"
        :variant="variant"
        name="passwordConfirm"
        :class="inputClass"
        autocomplete="new-password"
        @click:append-inner="show2 = !show2"
      />
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
const MIN_LENGTH = 6

defineProps<{
  modelValue?: string
  variant?: 'filled' | 'outlined' | 'plain' | 'underlined' | 'solo'
  notInLine?: boolean
  inputClass?: string
}>()
const emits = defineEmits<{(e: 'update:model-value', value?: string): void }>()

const password = ref('')
const passwordConfirm = ref('')
const show = ref(false)
const show2 = ref(false)

const rules = [
  (v?: string) => !!v || 'Mot de passe requis',
  (v: string) => (v && v.length >= MIN_LENGTH) || '6 caractères minimum'
]

watch(passwordConfirm, (val) => {
  if (password.value === val) {
    emits('update:model-value', val)
  }
})
</script>
