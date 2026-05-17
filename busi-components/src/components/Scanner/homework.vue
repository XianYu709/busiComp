<template>
  <ScannerPage :config="config" />
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useRoute } from "vue-router"
import { useUserStore } from "@apps/core/store/modules/user"
import ScannerPage, { type ScannerConfig } from "./ScannerPage.vue"
import { getHomeworkPage, getStatistics, getscanRecord } from "./api/scan"

const route = useRoute()
const userStore = useUserStore()

const services = computed(() => userStore.rawData?.academicYear?.[0]?.services || [])
const defaultService = computed(() => services.value[0] || {})

const config = computed<ScannerConfig>(() => ({
  mode: "homework",
  title: "扫描作业",
  name: (route.query.name as string) || "",
  nameLabel: "作业名称",
  gradeName: defaultService.value.gradeName || "",
  subjectName: defaultService.value.subjectName || "",
  subjectId: (route.query.subjectId as string) || "",
  showLayout: false,
  pageOptions: [
    { label: "一份作业一张纸", value: false },
    { label: "一份作业多张纸", value: true },
  ],
  labels: {
    should: "应交",
    actual: "实交",
    lack: "缺少作业",
    abnormal: "异常作业",
    unit: "个",
  },
  sessionKey: "scanner_homework_active_tab",
  getInitParams: () => {
    const svc = defaultService.value
    return {
      gradeId: route.query.gradeId ? Number(route.query.gradeId) : (svc.gradeId || undefined),
      subjectId: route.query.subjectId ? String(route.query.subjectId) : (svc.subjectId ? String(svc.subjectId) : undefined),
      classId: route.query.classId ? String(route.query.classId) : (svc.classId || undefined),
      locked: services.value.length > 0,
    }
  },
  fetchStats: async (scanRecordId, subjectId , scanTime) => {
    await getscanRecord(scanRecordId).catch(() => {})
    const res = await getStatistics({ scanRecordId, subjectId ,scanTime}) as any
    const d = res.data || {}
    return {
      shouldNum: d.shouldNum || 0,
      actualNum: d.actualNum || 0,
      lackNum: d.absentNum || 0,
      abnormalNum: d.errorNum || 0,
      scannedNum: d.scannedNum || 0,
      duplicateNum: d.repeatCodeNum || 0,
      otherNum: d.otherNum || 0,
      repeatNum: d.repeatNum || 0,
      errorNum: d.errorNum || 0,
    }
  },
  fetchList: async (params) => {
    const res = await getHomeworkPage(params) as any
    return { rows: res.rows || [], total: res.total ?? 0 }
  },
}))
</script>
