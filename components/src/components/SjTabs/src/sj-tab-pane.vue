<template>
  <div v-show="isActive" class="sjjb-tab-pane" :class="{ 'is-active': isActive }">
    <div class="bg-[#FFFFFF] box-border px-30px rounded-b-10px">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, onUnmounted, computed, type Component } from "vue";

interface Props {
  label: string;
  name: string | number;
  icon?: string;
  activeIcon?: string;
  iconComponent?: Component;
}

interface TabPaneConfig {
  name: string | number;
  label: string;
  icon?: string;
  activeIcon?: string;
  iconComponent?: Component;
}

const props = defineProps<Props>();

// 注入父组件提供的方法
const registerTabPane = inject<(tabPane: TabPaneConfig) => void>("registerTabPane");
const unregisterTabPane = inject<(name: string | number) => void>("unregisterTabPane");
const activeTabName = inject<() => string | number>("activeTabName", () => 0);

const isActive = computed(() => {
  return activeTabName() === props.name;
});

onMounted(() => {
  if (registerTabPane) {
    registerTabPane({
      name: props.name,
      label: props.label,
      icon: props.icon,
      activeIcon: props.activeIcon,
      iconComponent: props.iconComponent,
    });
  }
});

onUnmounted(() => {
  if (unregisterTabPane) {
    unregisterTabPane(props.name);
  }
});
</script>
