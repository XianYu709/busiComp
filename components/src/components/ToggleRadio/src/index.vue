<template>
  <el-radio :modelValue="modelValue ? label : null" :label="label" @click.stop="handleClick">
    <slot />
  </el-radio>
</template>

<script setup lang="ts">
defineOptions({ name: "ToggleRadio" });

import { defineProps, defineEmits } from "vue";

const props = defineProps<{
  modelValue: boolean;
  label?: string | number | boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "change", value: boolean): void;
}>();

const handleClick = () => {
  emit("update:modelValue", !props.modelValue);
  emit("change", !props.modelValue);
};
</script>
