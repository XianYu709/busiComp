# 分页组件 (Pagination)

## 使用方法

### 基础用法

```vue
<template>
  <CustomPagination
    :total="total"
    :current-page="currentPage"
    :page-size="pageSize"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  />
</template>

<script setup>
import { ref } from 'vue'
import { CustomPagination } from '@sjjb/busi-components'

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  console.log('每页条数变化:', val)
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  console.log('当前页变化-:', val)
}
</script>
```

### 自定义配置

```vue
<template>
  <CustomPagination
    :total="total"
    :current-page="currentPage"
    :page-size="pageSize"
    :page-sizes="[5, 10, 20, 50]"
    :pager-count="7"
    layout="total, sizes, prev, pager, next, jumper"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  />
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| total | 总条目数 | number | - |
| currentPage | 当前页数 | number | - |
| pageSize | 每页显示条目个数 | number | - |
| pageSizes | 每页显示个数选择器的选项设置 | number[] | [10, 20, 50, 100] |
| pagerCount | 页码按钮的数量，当总页数超过该值时会折叠 | number | 11 |
| layout | 组件布局，子组件名用逗号分隔 | string | 'prev, pager, next, sizes' |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| sizeChange | pageSize 改变时触发 | 每页条数 |
| currentChange | currentPage 改变时触发 | 当前页 |



