<template>
  <div class="flex items-center justify-end">
    <div
      class="flex text-center ml-4 cursor-pointer relative"
      v-for="item in actions"
      :key="item.id"
      @click="clickEvent(item)">
      <el-dropdown
        class="drop-container"
        v-if="item.options?.length"
        trigger="hover"
        :disabled="loadingMap[item.id]">
        <div class="flex items-center">
          <img
            :src="
              !item.disableSelect && active == item.id ? item.activeIcon || item.icon : item.icon
            "
            class="w-24px h-24px mr-2"
            alt="" />
          <div
            class="mb-2px text-15px flex items-center"
            :class="[!item.disableSelect && active == item.id ? 'text-primary' : 'color-#666']">
            <span class="h-25px leading-25px">{{ item?.text }}</span>
          </div>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="value in item.options"
              :key="value.text"
              @click.stop="value.click">
              {{ value.text }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <div
        v-else
        class="flex items-center"
        :class="[{ 'opacity-50 pointer-events-none': loadingMap[item.id] }]">
        <img
          :src="!item.disableSelect && active == item.id ? item.activeIcon || item.icon : item.icon"
          class="w-16px h-16px mr-2"
          alt="" />
        <div
          class="text-15px flex items-center"
          :class="[!item.disableSelect && active == item.id ? 'text-primary' : 'color-#666']">
          <span class="h-25px leading-25px">{{ item?.text }}</span>
          <el-icon v-if="loadingMap[item.id]" class="ml-1 animate-spin">
            <Loading />
          </el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { Loading } from "@element-plus/icons-vue";

type selectOption = {
  text: string;
  click: () => void;
};

export type actionType = {
  id: number;
  icon: any;
  activeIcon?: any;
  text: string;
  options?: selectOption[];
  click?: Function;
  disableSelect?: boolean;
  panel?: number | number[];
};

defineProps<{
  actions: actionType[];
}>();

const active = defineModel<string | number | null>("");

const loadingMap = ref<Record<number, boolean>>({});

const removeStatus = () => {
  active.value = null;
};

const clickEvent = async (item: actionType) => {
  if (!item.click) {
    return;
  }

  const isAsync = item.click.constructor.name === "AsyncFunction";
  if (isAsync) {
    loadingMap.value[item.id] = true;
  }

  try {
    const result = item.click(active.value != item.id, removeStatus);
    if (result instanceof Promise) {
      await result;
    }
  } catch (err) {
    ElMessage.error("执行操作失败");
    console.error(err);
  } finally {
    if (isAsync) loadingMap.value[item.id] = false;
  }

  if (active.value == item.id) return (active.value = null);
  active.value = item.id;
};

defineExpose({
  removeStatus,
});
</script>

<style scoped lang="scss">
:deep(.el-tooltip__trigger:focus-visible) {
  outline: unset;
}
</style>
