<template>
  <div :class="selectClass">
    <el-select
      v-model="selectedValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :clearable="clearable"
      :multiple="multiple"
      :filterable="filterable"
      @change="handleChange"
      @clear="handleClear">
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
        :disabled="item.disabled" />
    </el-select>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";

// 定义选项类型
interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

// Props
const props = defineProps({
  modelValue: {
    type: [String, Number, Array],
    default: "",
  },
  options: {
    type: Array as () => SelectOption[],
    default: () => [],
  },
  placeholder: {
    type: String,
    default: "Select",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  clearable: {
    type: Boolean,
    default: false,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  filterable: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String as () => "large" | "default" | "small",
    default: "default",
  },
  selectClass: {
    type: String,
  },
});

// Emits
const emit = defineEmits(["update:modelValue", "change", "clear"]);

// 响应式数据
const selectedValue = ref(props.modelValue);

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  newVal => {
    selectedValue.value = newVal;
  },
  { immediate: true },
);

// 监听 selectedValue 变化
watch(selectedValue, newVal => {
  emit("update:modelValue", newVal);
});

// 处理选择变化
const handleChange = (value: any) => {
  emit("change", value);
};

// 处理清空
const handleClear = () => {
  emit("clear");
};
</script>

<script lang="ts">
export default {
  name: "SjSelect",
};
</script>

<style scoped lang="scss">
.el-select-dropdown__item.is-hovering {
  background: none;
}
.el-select-dropdown__item:hover {
  background: #e7eefa;
}
:deep(.el-select__selected-item) {
  color: #333;
}
</style> 