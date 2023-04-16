<template>
  <v-text-field
    :model-value="formattedValue"
    :label="label"
    :rules="customRules"
    :prepend-inner-icon="prependInnerIcon"
    :append-icon="appendIcon"
    :readonly="readonly"
    :hint="hint"
    :persistent-hint="persistentHint"
    :disabled="disabled"
    :loading="loading"
    :single-line="singleLine"
    :hide-details="hideDetails"
    :variant="variant"
    :dense="dense"
    :class="center ? 'centeredInput' : ''"
    @update:model-value="updateValue"
    @click:append="$emit('click:append', $event)"
    @click:append-inner="$emit('click:append-inner', $event)"
    @click:prepend-inner="$emit('click:prepend-inner', $event)"
    @keypress="isNumber($event)"
  >
    <slot />
    <template #append>
      <slot name="append" />
    </template>
    <template #append-inner>
      <slot name="append-inner" />
    </template>
  </v-text-field>
</template>

<script lang="ts" setup>
import { toInt } from '@/assets/number'

const props = defineProps<{
  modelValue?: number
  options?: Intl.NumberFormatOptions
  label?: string
  prependInnerIcon?: string
  appendIcon?: string
  rules?: []
  disabled?: boolean
  readonly?: boolean
  hint?: string
  persistentHint?: boolean
  min?: number
  max?: number
  loading?: boolean
  singleLine?: boolean
  hideDetails?: boolean
  variant?: 'outlined' | 'filled' | 'plain' | 'underlined' | 'solo'
  dense?: boolean
  center?: boolean
}>()
const emits = defineEmits<{
  (e: 'update:model-value', val?: number): void
  (e: 'click:append'): void
  (e: 'click:append-inner'): void
  (e: 'click:prepend-inner'): void
}>()

const formattedValue = computed(() =>
  props.modelValue !== undefined ? props.modelValue : undefined
)
const customRules = computed(() => {
  const result: ((v?: number) => string | true)[] = [...(props.rules || [])]

  if (props.min !== null && props.min !== undefined) {
    // @ts-ignore
    result.push(
      (v: number) =>
        v >= props.min ||
        `La valeur doit être supérieure ou égale à ${props.min}`
    )
  }
  if (props.max !== null && props.max !== undefined) {
    // @ts-ignore
    result.push(
      (v: number) =>
        v <= props.max ||
        `La valeur doit être inférieure ou égale à ${props.max}`
    )
  }

  return result.map((rule) => {
    if (typeof rule !== 'function') {
      return rule
    }
    return (v: string) => rule(v || v === '0' ? toInt(v) : undefined)
  })
})

watch(
  () => props.modelValue,
  (val) => {
    if (typeof val === 'string') {
      emits('update:model-value', toInt(val))
    }
  }
)

let minus = false
const updateValue = (newValue?: string) => {
  if (newValue === '' || newValue === null) {
    return emits('update:model-value', undefined)
  }
  if (newValue === '-') {
    minus = true
    return emits('update:model-value', undefined)
  } else {
    const value = toInt((minus ? '-' : '') + newValue)
    minus = false
    if (isNaN(value)) {
      return emits('update:model-value', props.modelValue as number | undefined)
    }
    return emits('update:model-value', value)
  }
}

const isNumber = (evt: KeyboardEvent) => {
  evt = evt || window.event
  const charCode = evt.which ? evt.which : evt.keyCode
  if (
    charCode > 31 &&
    (charCode < 48 || charCode > 57) &&
    charCode !== 45 &&
    charCode !== 44
  ) {
    evt.preventDefault()
  } else {
    return true
  }
}
</script>

<style>
.centeredInput input {
  text-align: center;
}
</style>
