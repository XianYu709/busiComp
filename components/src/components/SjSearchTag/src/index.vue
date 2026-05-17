<script setup lang="ts">
import {  computed } from 'vue'

defineOptions({
  name: 'SjSearchTag'
})

interface TagOption {
  label: string
  value: string | number
  disabled?: boolean
}

interface Props {
  title?: string
  titleWidth?: string
  options: TagOption[]
  modelValue: string | number | Array<string | number>
  multiple?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string | number | Array<string | number>): void
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  titleWidth: 'auto',
  multiple: false
})

const emit = defineEmits<Emits>()

// 计算选中值
const selectedValues = computed({
  get: () => {
    return props.multiple
        ? (Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue])
        : props.modelValue
  },
  set: (value) => {
    emit('update:modelValue', value)
  }
})

// 判断是否选中
const isSelected = (value: string | number) => {
  if (props.multiple) {
    return Array.isArray(selectedValues.value) && selectedValues.value.includes(value)
  } else {
    return selectedValues.value === value
  }
}

// 处理点击事件
const handleClick = (option: TagOption) => {
  if (option.disabled) return

  if (props.multiple) {
    const currentValues = Array.isArray(selectedValues.value) ? [...selectedValues.value] : []
    const index = currentValues.indexOf(option.value)

    if (index > -1) {
      currentValues.splice(index, 1)
    } else {
      currentValues.push(option.value)
    }

    selectedValues.value = currentValues
  } else {
    selectedValues.value = option.value
  }
}
</script>

<template>
  <div class="flex ">
    <!-- 标题 -->
    <div
        class="search-tag-title  mr-8px"
        :style="{ width: titleWidth }"
    >
      {{ title }}
    </div>

    <!-- 标签选项 -->
    <div class="flex flex-wrap">
      <!-- 全部选项 -->
      <div
          class="search-tag-item"
          :class="{ 'search-tag-item-selected': !selectedValues || (Array.isArray(selectedValues) && selectedValues.length === 0) }"
          @click="selectedValues = multiple ? [] : ''"
      >
        全部
      </div>

      <!-- 其他选项 -->
      <div
          v-for="option in options"
          :key="option.value"
          class="search-tag-item"
          :class="{
          'search-tag-item-selected': isSelected(option.value),
          'search-tag-item-disabled': option.disabled
        }"
          @click="handleClick(option)"
      >
        {{ option.label }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-tag-title {
  font-weight: 500;
  font-size: 14px;
  color: #333333;
  line-height: 22px;
}

.search-tag-item {
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: #666666;
  text-align: center;
  margin-right: 30px;
  padding: 2px 12px;
  cursor: pointer;
  border-radius: 4px;
}

.search-tag-item-selected {
  background: #E7EFF9;
  color: #0E5FC7;
  font-weight: 500;
  line-height: 22px;
}

.search-tag-item-disabled {
  color: #C8C8C8;
  cursor: not-allowed;
  line-height: 22px;
}
</style>
