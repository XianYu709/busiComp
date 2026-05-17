# Select 选择器组件 基础封装、有缺失功能直接在里面加就行


## 基础用法

```vue
<template>
  <div>
    <!-- 基础用法 -->
    <Select
      v-model="value"
      :options="options"
      placeholder="请选择"
    />
    
    <!-- 带清空功能 -->
    <Select
      v-model="value"
      :options="options"
      placeholder="请选择"
      clearable
    />
    
    <!-- 可搜索 -->
    <Select
      v-model="value"
      :options="options"
      placeholder="请选择"
      filterable
    />
    
    <!-- 多选 -->
    <Select
      v-model="multipleValue"
      :options="options"
      placeholder="请选择"
      multiple
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Select } from '@sjjb/busi-components'

const value = ref('')
const multipleValue = ref([])

const options = ref([
  {
    value: '1',
    label: '版本1',
  },
  {
    value: '2',
    label: '版本2',
  },
  {
    value: '3',
    label: '版本3',
    disabled: true // 禁用选项
  }
])
</script>
```

## API

### Props

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| modelValue | String \| Number \| Array | '' | 绑定值，支持 v-model |
| options | Array | [] | 选项数据，格式见下方说明 |
| placeholder | String | 'Select' | 占位符文本 |
| disabled | Boolean | false | 是否禁用 |
| clearable | Boolean | false | 是否可以清空选项 |
| multiple | Boolean | false | 是否多选 |
| filterable | Boolean | false | 是否可搜索 |
| size | String | 'default' | 尺寸，可选值：large / default / small |
| minWidth | String | '120px' | 最小宽度 |

### Options 数据格式

```typescript
interface SelectOption {
  value: string | number  // 选项值
  label: string          // 选项显示文本
  disabled?: boolean     // 是否禁用该选项，可选
}
```

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| change | 选中值发生变化时触发 | 目前的选中值 |
| clear | 可清空的单选模式下用户点击清空按钮时触发 | — |

