<template>
  <el-button :type="type" :loading="loading" @click="handleClick" :class="buttonClass">
    <slot>{{ text }}</slot>
  </el-button>
</template>

<script setup lang="ts">
import { computed } from "vue";

// 定义 props
const props = withDefaults(
  defineProps<{
    type?: string;
    text?: string;
    variant?: "primary" | "secondary" | "info";
    size?: "small" | "default" | "large";
    loading?: boolean;
  }>(),
  {
    type: "primary",
    text: "确认",
    variant: "primary",
    size: "default",
    loading: false,
  },
);

// 定义 emits
const emit = defineEmits<{
  click: [event: Event];
}>();

// 计算按钮样式类
const buttonClass = computed(() => {
  const baseClass = "w-30 h-8 rounded-1";

  if (props.variant === "primary") {
    return `${baseClass} confirm-btn bg-#0052d9 border-none`;
  } else if (props.variant === "secondary") {
    return `${baseClass} cancel-btn bg-transparent border-1 border-solid border-#0052d9 color-#0052d9`;
  } else if (props.variant === "info") {
    return `${baseClass} info-btn bg-transparent border-none`;
  }

  return baseClass;
});

// 处理点击事件
const handleClick = (event: Event) => {
  emit("click", event);
};
</script>

<style scoped>
/* 可以在这里添加额外的样式 */

.confirm-btn {
  background: #0052d9 !important;
  border: none !important;
}
.cancel-btn {
  background: transparent !important;
  border: 1px solid #0052d9 !important;
  color: #0052d9 !important;
}
.info-btn {
  background: #e8e8e8 !important;
  border: none !important;
}
.confirm-btn:hover {
  background: #1890ff !important;
}

.cancel-btn:hover {
  background: rgba(14, 95, 199, 0.1) !important;
}
.info-btn:hover {
  background: #a6a9ad !important;
}
</style>
