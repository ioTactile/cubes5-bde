<template>
  <InputsNumber
    :model-value="modelValue"
    :rules="rules"
    :label="label"
    prepend-inner-icon="mdi-minus"
    append-inner-icon="mdi-plus"
    :min="1"
    class="rounded-lg"
    center
    :variant="variant"
    @click:append-inner="upQuantity"
    @click:prepend-inner="downQuantity"
    @update:model-value="$emit('update:model-value', $event)"
  />
</template>

<script lang="ts" setup>
const props = withDefaults(defineProps<{
  modelValue?: number,
  label?: string,
  rules?: [],
  variant?: 'filled' | 'outlined' | 'plain' | 'underlined' | 'solo',
}>(), {
  modelValue: undefined,
  label: 'Quantité',
  rules: undefined,
  variant: undefined
})

const emits = defineEmits<{(e: 'update:model-value', val?: number): void}>()

const upQuantity = () => {
  if (!props.modelValue) { return emits('update:model-value', 0) }
  return emits('update:model-value', props.modelValue + 1)
}
const downQuantity = () => {
  if (!props.modelValue) { return emits('update:model-value', 0) }
  if (props.modelValue > 0) { return emits('update:model-value', props.modelValue - 1) }
}
</script>
