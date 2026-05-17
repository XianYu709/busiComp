<template>
  <div class="flex items-center absolute right-0 top-0 text-sm group">
    <div
      v-for="value in scoreList"
      :key="value"
      class="relative cursor-pointer w-35px text-center text-13px flex items-center justify-center"
      style="border-bottom: 1px solid black; border-left: 1px solid black"
      :style="{
        borderTop: props.showTopLine ? '1px solid black' : 'none',
      }">
      {{ value }}
    </div>
  </div>

  <el-dialog v-model="visible" width="500" title="配置步长" destroy-on-close>
    <div class="flex items-center">
      <el-radio-group v-model="step" class="ml-4">
        <el-radio :value="0.5">0.5</el-radio>
        <el-radio :value="1">1</el-radio>
        <el-radio :value="1.5">1.5</el-radio>
        <el-radio :value="2">2</el-radio>
      </el-radio-group>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { buildScoreArray } from "../utils/buildScoreArray";

const props = withDefaults(
  defineProps<{
    totalScore?: number; // 总分
    showTopLine?: boolean;
  }>(),
  {
    totalScore: 0,
    showTopLine: false,
  },
);
const emits = defineEmits(["complete"]);

const step = defineModel<number>({
  type: Number,
  default: 1,
});

const visible = ref(false);
const activeValue = ref<number | null>(null);

const scoreList = computed(() => {
  const show = buildScoreArray(props.totalScore);
  emits("complete", show);
  return show;
});

const openDialog = (value: number) => {
  activeValue.value = value;
  visible.value = true;
};
</script>

<style scoped>
.group:hover .group-hover\:flex {
  display: flex !important;
}
</style>
