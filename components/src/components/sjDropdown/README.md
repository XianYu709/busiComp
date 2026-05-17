# sjDropdown 下拉选择组件




## 基础用法

```vue
<template>
  <sjDropdown
    v-model="selectedValue"
    :options="options"
    placeholder="请选择选项"
    @change="handleChange"
  />
</template>

<script setup>
import { ref } from 'vue'
import sjDropdown from '@sjjb/components/sjDropdown'

const selectedValue = ref('')
const options = [
  { label: '选项1', value: 'option1' },
  { label: '选项2', value: 'option2' },
  { label: '选项3', value: 'option3' }
]

const handleChange = (value) => {
  console.log('选中值:', value)
}
</script>
```

## 变体样式

### 筛选样式（Filter）
```vue
<sjDropdown
  v-model="selectedProvince"
  :options="provinceOptions"
  variant="filter"
  placeholder="选择省份"
/>
```

### 资源类型样式（Resource Type）
```vue
<sjDropdown
  v-model="selectedResourceType"
  :options="resourceTypeOptions"
  variant="resource-type"
  placeholder="全部类型"
/>
```

## Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| options | `DropdownOption[]` | `[]` | 下拉选项数组 |
| modelValue | `string \| number` | - | 当前选中值，支持 v-model |
| placeholder | `string` | `'请选择'` | 占位文本 |
| trigger | `'hover' \| 'click'` | `'click'` | 触发方式 |
| maxHeight | `string` | `'300px'` | 下拉菜单最大高度 |
| iconSrc | `string` | - | 自定义图标地址 |
| variant | 'filter' \| 'resource-type'` | `'default'` | 组件变体 |
| size | `'small' \| 'default' \| 'large'` | `'default'` | 组件尺寸 |
| disabled | `boolean` | `false` | 是否禁用 |

## Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| update:modelValue | `value: string \| number` | 值改变时触发，用于 v-model |
| command | `value: string \| number` | 选择选项时触发 |
| change | `value: string \| number` | 值改变时触发 |

## Slots

| 插槽名 | 参数 | 说明 |
|--------|------|------|
| trigger | - | 自定义触发器内容 |
| item | `{ option: DropdownOption }` | 自定义选项内容 |

## 类型定义

```typescript
interface DropdownOption {
  label: string    // 显示文本
  value: string | number    // 选项值
}
``` 