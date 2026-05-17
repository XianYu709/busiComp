# Dialog 弹窗组件 交友圈im即时通讯对话框


## 使用方法

### 基础用法-

```vue
<template>
  <div>
    <el-button @click="showDialog = true">打开弹窗</el-button>
    
    <Dialog
      v-model="showDialog"
      :resource-item="currentResource"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Dialog from '@/components/Dialog/index.vue'

const showDialog = ref(false)
const currentResource = ref({
  id: 1,
  title: '示例资源',
  // 其他资源信息...
})

const handleConfirm = (data) => {
  console.log('数据:', data)
  // 处理提交逻辑
}

const handleCancel = () => {
  console.log('取消')
}
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 弹窗显示状态 | boolean | false |
| resourceItem | 当前资源项数据 | any | null |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 弹窗显示状态变化 | (value: boolean) |
| confirm | 确认提交纠错 | (data: any) |
| cancel | 取消纠错 | - |

