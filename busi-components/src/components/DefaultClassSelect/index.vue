<template>
  <ElSelect v-model="value" :options="options" placeholder="请选择班级" />
</template>

<script setup lang="tsx">
import { ElSelect } from "element-plus";
import { computed } from "vue";

type classType = {
  className: string;
  classId: string;
};

const props = defineProps<{
  params: {
    teachClasses?: classType[];
    adminClasses?: classType[];
  };
}>();

const value = defineModel<string | string[] | null>();

const options = computed(() => {
  const adminOpt = {
    label: "行政班",
    options: (props.params.adminClasses || []).map(item => ({
      label: item.className,
      value: item.classId,
    })),
  };
  const teacherOpt = {
    label: "教师班",
    options: (props.params.teachClasses || []).map(item => ({
      label: item.className,
      value: item.classId,
    })),
  };
  value.value = adminOpt.options.length > 0 ? adminOpt.options[0]?.value : null;
  return [adminOpt, teacherOpt];
});
</script>

<style lang="scss" scoped></style>
