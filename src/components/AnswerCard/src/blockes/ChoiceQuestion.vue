<template>
  <div id="choiceQuestion">
    <div class="group relative w-full">
      <div class="absolute top-0 right-0 opacity-0 group-hover:opacity-100 flex align-start z-2">
        <div>
          <el-button @click="visible = true" text>设置单选</el-button>
        </div>
        <div>
          <el-button @click="e => $emit('delete', e)" text type="danger">删除</el-button>
        </div>
      </div>
      <div>
        <div v-if="isExportMode" class="text-16px font-500 text-left text-black h-30px leading-30px">
          {{ title || " " }}
        </div>
        <el-input v-else v-model="title" class="no-border-input input-title"></el-input>
        <div
          id="choiceContent"
          class="border flex py-10px items-start flex-wrap"
          :class="rightSetting.objectiveDirection == 'horizontal' ? 'pl-4px ' : 'pl-15px'">
          <div
            v-for="g in gourpList"
            :class="rightSetting.objectiveDirection == 'horizontal' ? 'mr-6px' : 'mr-10px'">
            <FillBox
              :pageBox="props.pageBox"
              :pageOf="props.pageOf"
              :everySetting="g"
              :direction="rightSetting.objectiveDirection"
              :border="false" />
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="visible" width="500" title="编辑" destroy-on-close>
      <div class="flex items-center">
        <div class="w-100px">每组题数:</div>
        <el-select
          v-model="group"
          style="width: 200px"
          :options="
            Array.from({ length: 5 }, (_, i) => ({
              label: String(i + 1),
              value: i + 1,
            }))
          " />
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, nextTick, onMounted, ref } from "vue";
import FillBox from "./FillBox.vue";

const props = withDefaults(
  defineProps<{
    pageBox?: Object;
    pageOf: number;
  }>(),
  {},
);
const emits = defineEmits(["delete", "end"]);

onMounted(() => {
  nextTick(() => {
    emits("end");
  });
});

const title = defineModel<any>("title");
const group = defineModel<any>("group");
const childs = defineModel("childs", {
  default: [],
});

const isExportMode = inject<any>("isExportMode");
const rightSetting = inject<any>("AnswerCardSetting");
const sortType = computed(() => rightSetting.value.sortType);

const visible = ref(false);

const gourpList = computed(() => {
  if (sortType.value === "smallFollow") {
    childs.value.forEach(item => {
      if (item?.copyIndex) item.prefix = item.copyIndex;
      else item.copyIndex = item.prefix;
    });
  }
  if (sortType.value === "bigSingle") {
    childs.value.forEach((item, index) => {
      item.prefix = index + 1;
    });
  }

  const res: any[][] = [];
  const list = childs.value || [];
  const size = Number(group.value) || 1;
  for (let i = 0; i < list.length; i += size) {
    res.push(list.slice(i, i + size));
  }
  return res;
});
</script>
<style lang="scss" scoped>
.box {
  border: 1px solid black;
  margin-bottom: 10px;
  box-sizing: border-box;
  padding: 10px;
}

.border {
  border: 1px solid black;
  box-sizing: border-box;

  &:hover {
    border: 1px solid blue;
  }
}

.border-r {
  border-right: 1px solid black;
  box-sizing: border-box;

  &:hover {
    border-right: 1px solid blue;
  }
}
/* 去掉边框、阴影、背景 */
.no-border-input :deep(.el-input__wrapper) {
  box-shadow: none !important;
  border: 1px solid transparent !important; /* 保留边框占位避免跳动 */
  background: transparent !important;
  margin: 0;
  padding: 0;
}

/* 聚焦时也不出现边框高亮 */
.no-border-input :deep(.el-input__wrapper.is-focus) {
  border: 1px solid blue !important; /* Element Plus 默认主题蓝 */
  box-shadow: none !important;
  background: transparent !important;
}

/* 标题样式 */
.input-title :deep(.el-input__inner) {
  font-size: 16px;
  font-weight: 500;
  color: #000; /* 黑色字体 */
  text-align: left;
}

/* 占位文字也变成黑色半透明 */
.no-border-input :deep(.el-input__inner::placeholder) {
  color: rgba(0, 0, 0, 0.4);
}
</style>
