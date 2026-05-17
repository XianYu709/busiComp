# Button 组件

一个基于 Element Plus 的可复用按钮组件。

## 使用方法

```vue
<template>
  <div>
    <!-- 主要按钮 -->
    <Button 
      variant="primary" 
      text="确认" 
      @click="handleConfirm" 
    />
    
    <!-- 次要按钮 -->
    <Button 
      variant="secondary" 
      text="取消" 
      @click="handleCancel" 
    />
    
    <!-- 使用插槽 -->
    <Button variant="primary" @click="handleSubmit">
      提交
    </Button>
  </div>
</template>

<script setup>
const handleConfirm = () => {
  console.log('确认操作');
};

const handleCancel = () => {
  console.log('取消操作');
};

const handleSubmit = () => {
  console.log('提交操作');
};
</script>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | String | 'primary' | Element Plus 按钮类型 |
| text | String | '确认' | 按钮文本（当没有使用插槽时） |
| variant | String | 'primary' | 按钮变体：'primary' \| 'secondary' |
| size | String | 'default' | 按钮尺寸：'small' \| 'default' \| 'large' |

## Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| click | 点击按钮时触发 | event: Event |

## 样式

- **primary**: 蓝色背景，白色文字
- **secondary**: 透明背景，蓝色边框和文字

两种变体都使用了 UnoCSS 类名进行样式设置。