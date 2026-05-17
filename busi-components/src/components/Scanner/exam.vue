<template>
  <ScannerPage :config="config" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import ScannerPage, { type ScannerConfig } from "./ScannerPage.vue";
import {
  getExamScanStatistics,
  getExamScanList,
  examWsScanRepeat,
  getCompleteScan,
} from "./api/scan";

const route = useRoute();

const examInfoId = computed(() => route.query.examInfoId as string);
const examProcessId = computed(() => route.query.examProcessId as string);
const examInfoName = computed(() => (route.query.examInfoName as string) || "");
const gradeName = computed(() => (route.query.gradeName as string) || "");
const gradeId = computed(() => (route.query.gradeId as string) || "");
const subjectName = computed(() => (route.query.subjectName as string) || "");
const subjectId = computed(() => (route.query.subjectId as string) || "");
const examProcessTemplateInstId = computed(
  () => (route.query.examProcessTemplateInstId as string) || "",
);
const scanType = computed(() => route.query.scanType as string);
const paperGenMethodOp = computed(() => route.query.paperGenMethod as string);

const config = computed<ScannerConfig>(() => ({
  mode: "exam",
  title: "扫描答卷",
  name: examInfoName.value,
  nameLabel: "考试名称",
  gradeName: gradeName.value,
  subjectName: subjectName.value,
  examInfoId: examInfoId.value,
  examProcessId: examProcessId.value,
  subjectId: subjectId.value,
  scanType: scanType.value,
  paperGenMethodOp: paperGenMethodOp.value,
  showLayout: true,
  pageOptions: [
    { label: "一份一张答题卡", value: false },
    { label: "一份多张答题卡", value: true },
  ],
  labels: {
    should: "应考",
    actual: "实考",
    lack: "缺少考卷",
    abnormal: "异常考卷",
    unit: "张",
  },
  sessionKey: "scanner_exam_active_tab",
  getInitParams: () => ({
    gradeId: gradeId.value ? Number(gradeId.value) : undefined,
    subjectId: subjectId.value || undefined,
    locked: true,
  }),
  fetchStats: async scanRecordId => {
    const res = await getExamScanStatistics({ scanRecordId });
    const d = res.data || {};
    return {
      shouldNum: d.shouldNum || 0,
      actualNum: d.actualNum || 0,
      lackNum: d.missingNum || 0,
      abnormalNum: d.errorNum || 0,
      scannedNum: d.actualNum || 0,
      duplicateNum: d.duplicateNum || 0,
      otherNum: d.otherNum || 0,
      repeatNum: d.repeatScanNum || 0,
      errorNum: d.errorNum || 0,
    };
  },
  fetchList: async params => {
    const res = (await getExamScanList({ ...params, examMainId: examInfoId.value })) as any;
    return { rows: res.rows || res.row || [], total: res.total ?? 0 };
  },
  onScanComplete: async scanRecordId => {
    if (examProcessTemplateInstId.value) {
      await getCompleteScan(examProcessTemplateInstId.value).catch(() => {});
    }
    await examWsScanRepeat(scanRecordId).catch(() => {});
  },
}));
</script>
