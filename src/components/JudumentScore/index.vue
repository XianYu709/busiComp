<template>
  <div
    class="ml-3 cursor-pointer color-primary truncate"
    :class="multipleForm.value ? 'w-160px' : 'w-auto'"
    @click="openJudument">
    <slot>
      {{ findLabel(multipleForm.value) }}
    </slot>
  </div>
  <ElDialog
    v-model="multipleRulesVisible"
    width="500"
    class="!p-6 !rounded-2"
    append-to-body
    destroy-on-close>
    <template #header>
      <div class="text-h4">设置判分规则</div>
      <div class="divider my-20px" />
    </template>
    <div class="px-16px">
      <div class="mb20px">
        <span class="color-[#333333] font-bold mr-20px">规则：</span>
        <ElSelect
          v-model="multipleForm.value"
          placeholder="Select"
          style="width: 80%"
          :options="setMultipleScoringRules" />
      </div>
      <div class="mb20px" v-if="multipleForm.value != '2'">
        <span class="color-[#333333] font-bold mr-20px">得分：</span>
        {{ multipleForm.value == "0" ? "少选得" : "选对一个得" }}
        <ElInputNumber
          v-model="multipleForm.score"
          :min="0"
          :max="100"
          controls-position="right"
          style="width: 80px" />
        分
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="closeJudument(false)">取消</ElButton>
        <ElButton type="primary" @click="closeJudument(true)">确定</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  rules: {
    type: Array,
    default: () => {},
  },
  immediate: {
    type: Boolean,
    default: true,
  },
});
const emit = defineEmits(["update:rules"]);

const multipleRulesVisible = ref(false);
const multipleForm = ref<any>({
  value: "0",
  score: 1,
});

const hasRules = computed(() => {
  return (
    props.rules && Object.keys(props.rules).length == 2 && props.rules?.score && props.rules?.score
  );
});

watch(
  () => props.rules,
  val => {
    if (hasRules.value) {
      multipleForm.value = val;
    }
  },
  {
    deep: true,
    immediate: true,
  },
);

const setMultipleScoringRules = ref<any[] | null>([]);

let request: any;
try {
  // @ts-ignore
  request = window.request;
} catch (error) {
  console.error("请检查子项目是否设置了全局axios实例！");
}

const CACHE_KEY = "set_decision_rule_cache";
const CACHE_TIME = 1 * 60 * 60 * 1000;

const getRules = async () => {
  const cache = localStorage.getItem(CACHE_KEY);
  if (cache) {
    const { time, data } = JSON.parse(cache);
    if (Date.now() - time < CACHE_TIME) {
      setMultipleScoringRules.value = data;
      return;
    }
  }

  const resp = await request({
    url: "/system-center/system/dict/data/type/set_decision_rule",
    method: "get",
  });
  const data = resp.data.map(item => ({
    label: item.dictLabel,
    value: item.dictValue,
  }));

  localStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), data }));

  setMultipleScoringRules.value = data;
};

getRules();

const findLabel = val => {
  return setMultipleScoringRules.value.find(item => item.value == val)?.label || "判分规则";
};

const openJudument = () => {
  multipleRulesVisible.value = true;
};
const closeJudument = (isSave: boolean = false) => {
  if (isSave) {
    emit("update:rules", multipleForm.value);
  }
  multipleRulesVisible.value = false;
};

if (props.immediate || !hasRules.value) emit("update:rules", multipleForm.value);
</script>

<style lang="scss" scoped></style>
