<template>
  <div class="items-center justify-center flex" :class="wrapperClass">
    <el-dropdown
      :class="dropdownClass"
      :trigger="trigger"
      :max-height="maxHeight"
      @command="handleCommand">
      <div :class="triggerClass">
        <slot name="trigger">
          <span :class="dropdownTextClass">{{ displayText }}</span>
          <img v-if="iconSrc" :src="iconSrc" alt="" :class="iconClass" />
          <el-icon v-else :class="iconClass">
            <arrow-down />
          </el-icon>
        </slot>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="option in options"
            :key="option.value"
            :command="option.value"
            :class="{ 'selected-item': isSelected(option.value) }">
            <slot name="item" :option="option">
              {{ option.label }}
            </slot>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ArrowDown } from "@element-plus/icons-vue";

// 定义选项类型
export interface DropdownOption {
  label: string;
  value: string | number;
}

// 定义 props
const props = withDefaults(
  defineProps<{
    options: DropdownOption[];
    modelValue?: string | number;
    placeholder?: string;
    trigger?: "hover" | "click";
    maxHeight?: string;
    iconSrc?: string;
    variant?: "default" | "filter" | "resource-type";
    size?: "small" | "default" | "large";
    disabled?: boolean;
    dropdownTextClass?: string;
  }>(),
  {
    placeholder: "",
    trigger: "click",
    maxHeight: "300px",
    variant: "default",
    size: "default",
    disabled: false,
    dropdownTextClass: "color-#0E5FC7",
  },
);

// 定义 emits
const emit = defineEmits<{
  "update:modelValue": [value: string | number];
  command: [value: string | number];
  change: [value: string | number];
}>();

// 计算显示文本
const displayText = computed(() => {
  if (props.modelValue) {
    const selectedOption = props.options.find(option => option.value === props.modelValue);
    return selectedOption?.label || props.placeholder;
  }
  return props.placeholder || "";
});

// 判断是否选中
const isSelected = (value: string | number) => {
  return props.modelValue === value;
};

// 计算包装器样式类
const wrapperClass = computed(() => {
  const classes = [];

  if (props.variant === "resource-type") {
    classes.push("w-32 h-9 bg-#E7EFF9 rounded-1 flex items-center justify-center");
  }

  return classes.join(" ");
});

// 计算下拉框样式类
const dropdownClass = computed(() => {
  const classes = ["cursor-pointer"];

  if (props.disabled) {
    classes.push("disabled");
  }

  return classes.join(" ");
});

// 计算触发器样式类
const triggerClass = computed(() => {
  const classes = [];

  switch (props.variant) {
    case "filter":
      classes.push("el-dropdown-link text-h4 text-text-primary cursor-pointer");
      break;
    case "resource-type":
      classes.push("color-#0E5FC7 text-content fw-500  items-center justify-center gap-5 flex");
      break;
    default:
      classes.push("flex items-center justify-center  cursor-pointer");
  }

  return classes.join(" ");
});

// 计算图标样式类
const iconClass = computed(() => {
  const classes = [];

  if (props.iconSrc) {
    classes.push("w-4 h-4");
  } else {
    classes.push("el-icon--right");
  }

  return classes.join(" ");
});

// 处理选择事件
const handleCommand = (value: string | number) => {
  emit("update:modelValue", value);
  emit("command", value);
  emit("change", value);
};
</script>

<style lang="scss" scoped>
.sj-dropdown-wrapper {
  // display: inline-block;

  &.disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.dropdown-text {
  color: inherit;
}

// 下拉菜单选中状态样式
:deep(.el-dropdown-menu__item.selected-item) {
  background-color: #f0f7ff;
  color: #409eff;
  font-weight: 500;

  &:hover {
    background-color: #e6f4ff;
  }
}

// 资源类型变体的特殊样式
.sj-dropdown-wrapper.resource-type {
  .el-dropdown {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
