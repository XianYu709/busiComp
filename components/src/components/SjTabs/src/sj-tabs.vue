<template>
  <div class="sjjb-tabs">
    <div class="flex items-center gap-8px">
      <div
        v-for="tab in tabPanes"
        :key="tab.name"
        class="tab-pane flex items-center justify-center px-35px py-15px gap-14px cursor-pointer transition-all duration-300"
        :class="{ 'is-active': modelValue === tab.name }"
        @click="handleTabClick(tab.name)">
        <component :is="tab.iconComponent" v-if="tab.iconComponent" class="tab-icon" />
        <img
          v-else-if="tab.icon || tab.activeIcon"
          :src="modelValue === tab.name ? tab.activeIcon : tab.icon"
          alt=" "
          class="tab-icon" />
        {{ tab.label }}
      </div>

      <!-- 添加右侧插槽 -->
      <div class="flex-1"></div>
      <div class="tab-extra-content">
        <slot name="extra"></slot>
      </div>
    </div>

    <div class="tab-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, provide, type Component } from "vue";

interface TabPane {
  name: string;
  label: string;
  icon?: string;
  activeIcon?: string;
  iconComponent?: Component;
}

interface Props {
  modelValue: string | number;
}

interface Emits {
  (e: "update:modelValue", value: string | number): void;

  (e: "tab-change", tabName: string | number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 存储所有 tab-pane 的信息
const tabPanes = ref<TabPane[]>([]);

// 提供给子组件的方法
const registerTabPane = (tabPane: TabPane) => {
  const existingIndex = tabPanes.value.findIndex(tab => tab.name === tabPane.name);
  if (existingIndex !== -1) {
    tabPanes.value[existingIndex] = tabPane;
  } else {
    tabPanes.value.push(tabPane);
  }
};

const unregisterTabPane = (name: string) => {
  const index = tabPanes.value.findIndex(tab => tab.name === name);
  if (index !== -1) {
    tabPanes.value.splice(index, 1);
  }
};

// 提供给子组件的方法
provide("registerTabPane", registerTabPane);
provide("unregisterTabPane", unregisterTabPane);
provide("activeTabName", () => props.modelValue);

const handleTabClick = (tabName: string | number) => {
  emit("update:modelValue", tabName);
  emit("tab-change", tabName);
};
</script>

<style lang="scss" scoped>
.tab-pane {
  background: #e8e8e8;
  box-shadow: 0px -2px 4px 0px rgba(0, 0, 0, 0.05);
  border-radius: 10px 10px 0px 0px;
  font-family:
    Source Han Sans,
    sans-serif;
  font-weight: 500;
  font-size: 16px;
  color: #333333;
  line-height: 24px;
  text-align: left;
  font-style: normal;
  text-transform: none;
  transition: all 0.3s ease;

  &.is-active {
    background: #ffffff;
    box-shadow: 0px -2px 4px 0px rgba(0, 0, 0, 0.05);
  }
}

.tab-extra-content {
  margin-left: auto;
  display: flex;
  align-items: center;
}
</style>
