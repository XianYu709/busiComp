<template>
  <div ref="scoreBoardRef" :class="drageable ? 'fixed right-40px top-140px' : ''">
    <Card :body-style="{ padding: '0', overflow: 'hidden' }">
      <div ref="draggableAreaRef" class="right-title" style="border-bottom: 1px solid #ebeef5">
        批阅操作
      </div>
      <ElCollapse style="width: 100%" :model-value="['list', 'mark', 'markboard', 'submit']">
        <el-collapse-item name="list" v-if="props.showMoudle.includes('list')">
          <template #title>
            <div class="right-title">批阅</div>
          </template>
          <div class="flex flex-col px-20px -mb-15px">
            <StudentMark v-for="(stu, index) in endList" :stu="stu" :index="index" />
          </div>
        </el-collapse-item>
        <ElCollapseItem name="mark" v-if="props.showMoudle.includes('mark')">
          <template #title>
            <div class="right-title">打分栏</div>
          </template>
          <div class="flex flex-col items-center">
            <div style="transform: scale(0.9); width: 100%">
              <ButtonTab
                v-model="markType"
                :items="[
                  {
                    label: '键盘打分',
                    value: 1,
                  },
                  {
                    label: '分步赋分',
                    value: 2,
                  },
                ]"
                @on-change="
                  val => {
                    if (val == 1) stepPrefix = '';
                    if (val == 2) stepPrefix = '+';
                    stepChange(step);
                  }
                " />
            </div>
            <div class="self-start pt-20px px-20px -mb-15px">
              <StudentMark v-for="(stu, index) in currentList" :stu="stu" :index="index" />
            </div>
            <div
              v-if="markType == 2"
              class="bg-#E7EFF9 p-4px w-88.5% mt-25px flex justify-center items-center">
              <ElRadioGroup
                v-model="stepPrefix"
                @change="
                  () => {
                    stepScoreList = [];
                    stepChange(step);
                  }
                ">
                <ElRadio value="+">加分模式</ElRadio>
                <ElRadio value="-">减分模式</ElRadio>
              </ElRadioGroup>
            </div>
          </div>
        </ElCollapseItem>
        <ElCollapseItem name="markboard" v-if="props.showMoudle.includes('markboard')">
          <template #title>
            <div class="right-title">打分板</div>
          </template>
          <div class="px-20px -mb-15px">
            <div class="flex justify-between mb-15px">
              步长：
              <ElSelect
                v-model="step"
                style="width: 100px"
                size="small"
                placeholder="选择步长"
                :options="stepList"
                @change="stepChange" />
            </div>
            <div class="flex flex-wrap pt-5px -ml-10px">
              <ElButton
                class="mb-3"
                style="margin-left: 10px"
                v-for="item in stepScoreList"
                @click="scoreHanlder(item)">
                {{ item.label }}
              </ElButton>
            </div>
          </div>
        </ElCollapseItem>
        <ElCollapseItem name="submit" v-if="props.showMoudle.includes('submit')">
          <template #title>
            <div class="right-title">分数提交</div>
          </template>
          <div class="px-20px flex items-center">
            <slot name="submit" :submit="() => submitHander(currentList, true)">
              <ElButton
                type="primary"
                class="mr-20px"
                style="width: 100px"
                @click="submitHander(currentList, true)">
                提交
              </ElButton>
              <ToggleRadio v-model="autoSubmit">自动提交</ToggleRadio>
            </slot>
          </div>
        </ElCollapseItem>
      </ElCollapse>
    </Card>
  </div>
</template>

<script setup name="ScoreBoard" lang="tsx">
import { ToggleRadio, Card, ButtonTab } from "@sjjb/components";
import { useDraggable } from "@sjjb/utils";
import { ElButton, ElInput, ElCollapse, ElMessage } from "element-plus";
import { computed, onMounted, ref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    fieldsMap: {
      name: string;
      score: string;
      totalScore: string;
    };
    maxScore?: number;
    showMoudle?: ("list" | "mark" | "markboard" | "submit")[];
  }>(),
  {
    // @ts-ignore
    showMoudle: ["list", "mark", "markboard", "submit"],
  },
);
const emits = defineEmits(["submit"]);

const scoreBoardRef = ref<HTMLElement | null>(null);

const drageable = defineModel<boolean>("drageable", {
  default: false,
});
const draggableIns = useDraggable(scoreBoardRef, {
  handle: ".right-title",
});
onMounted(() => {
  draggableIns.disable();
});

watch(
  () => drageable.value,
  val => {
    if (val) {
      draggableIns && draggableIns.enable();
    } else {
      draggableIns && draggableIns.disable();
      const el = scoreBoardRef.value;
      if (el) {
        el.style.transform = "";
      }
    }
  },
  { immediate: true },
);

const endList = defineModel<any[] | undefined>("endList");
const currentList = defineModel<any[]>("currentList");
const autoSubmit = defineModel<boolean>("autoSubmit", {
  default: false,
});

const maxScore = computed(() => {
  const totalKey = props.fieldsMap["totalScore"];
  return props?.maxScore || currentList.value?.[0][totalKey] || 0;
});
const step = ref<number | null>(null);
const stepList = [
  { label: "0.5", value: 0.5 },
  {
    label: "1",
    value: 1.0,
  },
  {
    label: "1.5",
    value: 1.5,
  },
  {
    label: "2",
    value: 2.0,
  },
  {
    label: "3",
    value: 3.0,
  },
  {
    label: "4",
    value: 4.0,
  },
  {
    label: "5",
    value: 5.0,
  },
];

const stepScoreList = ref<{ label: string; value: number }[] | []>([]);
const stepPrefix = ref<"+" | "-" | "">("");
const stepChange = (val: number | null) => {
  if (!val) return;
  const max = Number(maxScore.value);
  if (val <= 0) {
    stepScoreList.value = [];
    return;
  }

  const countDecimals = (n: number) => {
    const s = String(n);
    return s.includes(".") ? s.split(".")[1].length : 0;
  };
  const decimals = Math.max(countDecimals(val), countDecimals(max));
  const factor = Math.pow(10, decimals);

  const intVal = Math.round(val * factor);
  const intMax = Math.round(max * factor);

  const n = Math.floor(intMax / intVal);
  const arr: number[] = [];

  for (let i = 1; i <= n; i++) {
    arr.push((i * intVal) / factor);
  }

  if (n === 0 || n * intVal !== intMax) {
    arr.push(intMax / factor);
  }

  stepScoreList.value = arr.map(item => {
    return {
      label: stepPrefix.value + item.toString(),
      value: item,
    };
  });
};

const keyMap = props.fieldsMap || {
  name: "name",
  score: "score",
  totalScore: "totalScore",
};

const submitHander = (list?: any[], submit: boolean = false) => {
  if (list?.length === 0) return ElMessage.warning("暂无批阅数据");
  if (!list || list.length === 0) return;
  setTimeout(() => {
    emits("submit", {
      process: list,
      isFinish: currentList.value && currentList.value.length == 0,
      submit,
    });
  }, 0);
};

const StudentMark = (opt: { index: number; stu: any }) => {
  if (!opt.stu) return null;

  return (
    <div class='flex items-center justify-between mb-10px'>
      <div class={"w-25%  text-left"}>{opt.stu[keyMap.name]}</div>
      <ElInput
        v-model={opt.stu[keyMap.score]}
        class='mx-3 el-input-score'
        style='width: 40%;'
        onChange={() => {
          submitHander([opt.stu]);
        }}
      />
      <ElButton
        type='primary'
        class='active:opacity-50 hover:opacity-80'
        style={{ background: "#E7EFF9 ", border: "none", color: "#0E5FC7" }}
        onClick={() => {
          opt.stu[keyMap.score] = opt.stu[keyMap.totalScore] || maxScore.value || 0;
          submitHander([opt.stu]);
        }}>
        满分
      </ElButton>
      <ElButton
        type='danger'
        class=' active:opacity-50 hover:opacity-80'
        style={{ background: "#FDE8E8", border: "none", color: "#EB1919" }}
        onClick={() => {
          opt.stu[keyMap.score] = 0;
          submitHander([opt.stu]);
        }}>
        零分
      </ElButton>
    </div>
  );
};
const markType = ref(1);
const scoreHanlder = e => {
  if (currentList.value?.length === 0) return ElMessage.warning("暂无批阅数据");
  const isNegative = stepPrefix.value === "-";
  currentList.value?.map(item => {
    if (markType.value === 1) item[keyMap.score] = e.value;
    else {
      const temp = Number(item[keyMap.score]) + (isNegative ? Number(-e.value) : Number(e.value));
      if ((isNegative && temp < 0) || (!isNegative && temp > maxScore.value)) {
        return ElMessage.warning("超出分数范围");
      }
      item[keyMap.score] = temp;
    }
  });
  submitHander(currentList.value);
};
</script>
<style lang="scss" scoped>
.right-title {
  cursor: pointer;
  padding: 15px;
  font-family:
    Source Han Sans,
    Source Han Sans;
  font-weight: 500;
  font-size: 16px;
  color: #333333;
  line-height: 24px;
  text-align: left;
  font-style: normal;
  text-transform: none;
}

:deep(.el-collapse-item__header) {
  width: 98%;
  // border-bottom: 1px solid #d8d8d8;
}
</style>
<style lang="scss">
.el-input-score {
  .el-input__inner {
    text-align: center;
  }
}

.el-table tbody tr:hover > td {
  background-color: transparent !important;
}
</style>
