<template>
  <div v-loading="loading">
    <div v-for="value in props.needsFields">
      <div class="flex flex-wrap items-center">
        <div class="mb-12px">{{ value }} :</div>
        <div
          v-for="item in dataMpas[dataMap[value]]"
          class="ml-12px mb-12px cursor-pointer py-1px px-6px rounded-4px"
          :class="getSelectValue(value) == item.value ? 'text-primary bg-#E7EFF9' : ''"
          @click="clickHandler(fildsMap[value], item.value, item)">
          {{ item.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, unref, watch } from "vue";
import getDictSelectData from "./getData";
type AllowedField = "学段" | "学科" | "年级" | "模块" | "版本" | "版别";
type filedsType = {
  [key: string]: string;
};
type propsType = {
  needsFields: AllowedField[];
  onlyIdInput?: number[] | string[];
  modelValue: filedsType;
  onlyId?: boolean;
};
type fildsMap = { [key in AllowedField]: string };

const props = withDefaults(defineProps<propsType>(), {
  modelValue: {
    periodId: null,
    versionId: null,
    subjectId: null,
    gradeId: null,
    moduleId: null,
    editionId: null,
    seriesId: null,
  },
  onlyId: true,
});
const emtis = defineEmits(["onChange", "update:modelValue", "update:fullModel"]);

const fildsMap: fildsMap = {
  学段: "periodId",
  学科: "subjectId",
  年级: "gradeId",
  模块: "moduleId",
  版本: "versionId",
  版别: "editionId",
};

const dataMap: fildsMap = {
  学段: "periodList",
  学科: "subjectList",
  年级: "gradeList",
  模块: "moduleList",
  版本: "versionList",
  版别: "editionList",
};

const dataMpas = ref<any>({
  periodList: [],
  subjectList: [],
  gradeList: [],
  moduleList: [],
  editionList: [],
  seriesList: [],
  verversionListsionId: [],
});

const loading = ref(false);
const getDictData = async (params?: any) => {
  loading.value = true;
  try {
    params?.periodId && (params.periodId = Number(params?.periodId));
    const allData = await getDictSelectData(params);
    dataMpas.value = allData;
  } finally {
    loading.value = false;
  }
};

const select = computed({
  get() {
    return props.modelValue;
  },
  set(val: string[]) {
    emtis("update:modelValue", val);
    emtis("onChange", val);
  },
});

const getSelectValue = (value: any) => {
  const field = fildsMap[value as keyof typeof fildsMap];
  return props.onlyId ? select.value[field] : select.value[field]?.value;
};

/** 与教研 tree 等读取的 periodId / subjectId 键保持一致 */
const syncPeriodSubjectToLocalStorage = () => {
  const mv = select.value as Record<string, any>;
  const periodRaw = props.onlyId ? mv.periodId : mv.periodId?.value;
  const subjectRaw = props.onlyId ? mv.subjectId : mv.subjectId?.value;

  if (periodRaw !== undefined && periodRaw !== null && periodRaw !== "") {
    localStorage.setItem("periodId", String(periodRaw));
  } else {
    localStorage.removeItem("periodId");
  }
  if (subjectRaw !== undefined && subjectRaw !== null && subjectRaw !== "") {
    localStorage.setItem("subjectId", String(subjectRaw));
  } else {
    localStorage.removeItem("subjectId");
  }
};

const clickHandler = (key: string, value: any, item: object) => {
  switch (key) {
    case "periodId":
      select.value["subjectId"] = "";
      select.value["gradeId"] = "";
      select.value["moduleId"] = "";
      select.value["versionId"] = "";
      select.value["editionId"] = "";
      break;
    case "gradeId":
      select.value["subjectId"] = "";
      select.value["moduleId"] = "";
      select.value["versionId"] = "";
      select.value["editionId"] = "";
      break;
    case "subjectId":
      select.value["moduleId"] = "";
      select.value["versionId"] = "";
      select.value["editionId"] = "";
      break;
    case "versionId":
      select.value["editionId"] = "";
      break;
  }
  const featureValue = props.onlyId ? value : unref(item);
  if (select.value[key] == featureValue) {
    select.value[key] = "";
    syncPeriodSubjectToLocalStorage();
    return;
  }
  select.value[key] = featureValue;
  syncPeriodSubjectToLocalStorage();
};

watch(
  () => select.value,
  () => {
    const getKeyValue = () => {
      if (props.onlyId) {
        return select.value;
      }
      const keyValue: { [key: string]: any } = {};
      Object.entries(select.value || {}).forEach(([key, obj]: [string, any]) => {
        keyValue[key] =
          obj != null && typeof obj === "object" && "value" in obj ? obj.value : undefined;
      });
      return keyValue;
    };
    getDictData(getKeyValue());
  },
  { deep: true, immediate: true },
);
</script>

<style lang="scss" scoped></style>
