<template>
  <div class="px-20px">
    <!-- 连接状态提示 -->
    <div v-if="wsConnecting" class="connection-status">
      <el-alert title="正在连接扫描仪..." type="info" show-icon :closable="false" />
    </div>
    <div v-if="wsError" class="connection-status">
      <el-alert
        title="连接扫描仪失败"
        type="error"
        show-icon
        :closable="false"
        :description="wsErrorMsg">
        <template #action>
          <el-button type="danger" size="small" @click="reconnectWebSocket">重试连接</el-button>
        </template>
      </el-alert>
    </div>

    <div class="header">
      <div class="header-l">
        <div @click="goBack">
          <img src="./images/back.png" />
          <span>{{ isLoading ? '上传中...' : '返回上一步' }}</span>
        </div>
      </div>
      <div class="header-c">
        <span class="header-c-title">{{ config.title }}</span>
        <div class="header-c-des">
          <span class="span1">{{ config.nameLabel }}：{{ config.name }}</span>
          <span class="span2">年级：{{ config.gradeName }}</span>
          <span class="span3">学科：{{ config.subjectName }}</span>
        </div>
      </div>
      <div class="header-r">
        <el-button
          type="primary"
          @click="openDialog"
          :disabled="!wsConnected || wsConnecting || scanningProgress.isScanning"
          :loading="scanningProgress.isScanning">
          {{ getScanButtonText }}
        </el-button>
      </div>
    </div>

    <div class="content">
      <div class="content-left">
        <div class="menu-container">
          <el-menu
            :default-active="activeMenuIndex"
            class="custom-menu"
            :unique-opened="true"
            @select="handleMenuSelect">
            <el-menu-item index="1">
              <template #title>
                <span>{{ config.labels.should }}（{{ shouldNum }}）</span>
              </template>
            </el-menu-item>
            <el-menu-item index="2">
              <template #title>
                <span>{{ config.labels.actual }}（{{ actualNum }}）</span>
              </template>
            </el-menu-item>
            <!-- <el-menu-item index="3">
              <template #title>
                <span>{{ config.labels.lack }}（{{ lackNum }}）</span>
              </template>
            </el-menu-item> -->
            <el-sub-menu index="7">
              <template #title>
                <span>{{ config.labels.abnormal }}（{{ abnormalNum }}）</span>
              </template>
              <el-menu-item index="4">学号异常（{{ duplicateNum }}）</el-menu-item>
              <el-menu-item index="5">其他异常（{{ otherAbnormalNum }}）</el-menu-item>
            </el-sub-menu>
            <el-menu-item index="6">
              <template #title>
                <span>重复扫描（{{ repeatScanNum }}）</span>
              </template>
            </el-menu-item>
          </el-menu>
        </div>
      </div>

      <div class="content-right w-100%">
        <div class="content-right-header">
          <div class="content-right-header-l">
            <div>
              <span class="num">{{ actualNum }}</span>
              <span class="fh">{{ config.labels.unit }}</span>
              <p class="scan bg-#E7EFF9"><span class="ysm color-#0E5FC7">已扫描</span></p>
            </div>
            <img src="./images/239(1).png" alt="" />
          </div>
          <div class="content-right-header-c">
            <div>
              <span class="num">{{ actualNum }}</span>
              <span class="fh">{{ config.labels.unit }}</span>
              <p class="scan bg-#E9F6F3"><span class="ysm color-#20A28B">已识别</span></p>
            </div>
            <img src="./images/ysb.png" alt="" />
          </div>
          <div class="content-right-header-r">
            <div>
              <span class="num">{{ errorNum }}</span>
              <span class="fh">{{ config.labels.unit }}</span>
              <p class="scan bg-#FDE8E8">
                <span class="color-#EB1919">{{ config.labels.abnormal }}</span>
              </p>
            </div>
            <img src="./images/239(2).png" alt="" />
          </div>
        </div>

        <!-- 扫描进度提示 -->
        <div v-if="scanningProgress.isScanning" class="scanning-progress">
          <el-progress
            :percentage="scanningProgress.progress"
            :stroke-width="15"
            :text-inside="true"
            status="success" />
          <div class="progress-text">{{ scanningProgress.statusText }}</div>
        </div>

        <div class="content-right-table">
          <component
            :is="currentComponent"
            :message="config.mode"
            :record-id="recordId"
            :list-data="currentTableData"
            :total="currentTabTotal"
            :subtitle="currentTableSubtitle"
            :should-label="config.labels.should"
            :actual-label="config.labels.actual"
            :lack-label="config.labels.lack"
            :other-label="'其他异常'"
            :repeated-label="'重复扫描'"
            :abnormal-label="activeMenuIndex === '5' ? '其他异常' : '学号异常'"
            v-bind="abnormalTabExtraProps"
            :exam-info-id="config.examInfoId"
            :subject-id="config.subjectId"
            :academic-year="userStore.academicYearId"
            :grade="formData.grade"
            :class-id="formData.class"
            @page-change="onTabPageChange"
            @refresh="refreshAllData"
            @search="onTabSearch" />
        </div>
      </div>
    </div>

    <!-- 扫描设置对话框 -->
    <el-dialog
      v-model="dialogFormVisible"
      title="开始扫描"
      width="600px"
      :close-on-click-modal="false"
      destroy-on-close
      class="scan-setting-dialog">
      <el-form
        :model="formData"
        :rules="rules"
        ref="ruleFormRef"
        size="large"
        label-position="top"
        class="custom-scan-form">
        <el-form-item label="选择扫描仪" prop="scanName">
          <el-select
            v-model="formData.scanName"
            placeholder="请选择"
            @change="onchangeDevide"
            class="white-input"
            style="width: 100%">
            <el-option v-for="(item, index) in devices" :key="index" :label="item" :value="item" />
          </el-select>
        </el-form-item>

        <el-form-item label="选择纸张" prop="paperSize">
          <el-select
            v-model="formData.paperSize"
            placeholder="请选择"
            style="width: 100%"
            class="white-input"
            @change="onChangePaperSize">
            <el-option
              v-for="(item, index) in paperSizeList"
              :key="index"
              :label="item"
              :value="item" />
          </el-select>
        </el-form-item>

        <!-- 栏数：仅考试模式显示 -->
        <el-form-item v-if="config.showLayout" label="选择栏数" prop="layout">
          <el-select
            v-model="formData.layout"
            placeholder="请选择"
            style="width: 100%"
            class="white-input">
            <el-option
              v-for="item in layoutList"
              :key="item.value"
              :label="item.label"
              :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="选择学科" prop="subject">
          <div class="flex w-100% gap-15px">
            <el-select
              v-model="formData.subject"
              placeholder="请选择学科"
              :disabled="isSubjectDisabled"
              class="gray-display-input flex-1">
              <el-option
                v-for="item in subjectData"
                :key="item.dictCode"
                :label="item.dictLabel"
                :value="item.dictValue" />
            </el-select>
            <el-button class="select-trigger-btn" @click="handleOtherSubject">选择学科</el-button>
          </div>
        </el-form-item>

        <el-form-item label="选择年级" prop="grade">
          <el-select
            v-model="formData.grade"
            placeholder="请选择年级"
            :disabled="isGradeDisabled"
            @change="changeGrade"
            class="gray-display-input w-100%">
            <el-option
              v-for="item in gradeOptions"
              :key="item.gradeId"
              :label="item.gradeName"
              :value="item.gradeId" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="config.mode == 'homework'" label="选择班级" prop="class">
          <div class="flex w-100% gap-15px">
            <el-select
              v-model="formData.class"
              placeholder="请选择班级"
              :disabled="isClassDisabled || !formData.grade"
              no-data-text="该年级下暂无班级"
              class="gray-display-input flex-1"
              @change="onClassChange">
              <el-option
                v-for="item in classList"
                :key="item.id"
                :label="item.name"
                :value="item.id" />
            </el-select>
            <el-button class="select-trigger-btn" @click="handleOtherClass">选择班级</el-button>
          </div>
        </el-form-item>

        <div class="dialog-action-area">
          <el-button
            type="primary"
            @click="submitForm(ruleFormRef)"
            size="large"
            class="footer-confirm-btn">
            确认
          </el-button>
          <el-button @click="dialogFormVisible = false" size="large" class="footer-cancel-btn">
            返回
          </el-button>
        </div>
      </el-form>

      <el-dialog v-model="innerVisible" width="300px" title="提示" append-to-body center>
        <div class="inner-msg">
          {{
            props.config.mode == "homework"
              ? "请确认所选年级班级学科等数据正确"
              : "确认提交扫描设置吗？"
          }}
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="innerVisible = false">取 消</el-button>
            <el-button type="primary" @click="isShowdialog">确 认</el-button>
          </div>
        </template>
      </el-dialog>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  shallowRef,
  computed,
  watch,
  onUnmounted,
  onMounted,
  onActivated,
  onBeforeUnmount,
} from "vue";
import { ElLoading, ElMessage } from "element-plus";
import type { FormRules, FormInstance } from "element-plus";
import Actual from "./components/Actual.vue";
import Should from "./components/Should.vue";
import Lack from "./components/Lack.vue";
import Abnormal from "./components/Abnormal.vue";
import Other from "./components/Other.vue";
import Repeated from "./components/Repeated.vue";

import {
  initBWebSocket,
  startScan,
  onDeviceChanged,
  setScanParams,
  setGlobalConfig,
  deviceName,
  devices,
  deviceOpened,
  paperSize_value,
  paperSize_list,
  recordId,
  isClose,
  msg,
  isLoading,
  cleanupWebSocket,
  scanningState,
  wsConnectionState,
  subjectDefault,
  classId,
} from "./js/scanWeb";
import { getDicts, getInfo, classListAuth } from "./api/scan";
import { useUserStore } from "@apps/core/store/modules/user";
import {useRoute, useRouter} from "vue-router";
import { SnowflakeIdGenerator } from "@sjjb/utils";

const router = useRouter();
export interface ScannerConfig {
  mode: "exam" | "homework";
  title: string;
  name: string;
  nameLabel: string;
  gradeName: string;
  subjectName: string;
  examInfoId?: string | string[];
  examProcessId?: string | number;
  subjectId?: string | string[];
  scanType?: string;
  paperGenMethodOp?: string;
  showLayout: boolean;
  pageOptions: { label: string; value: boolean }[];
  labels: {
    should: string;
    actual: string;
    lack: string;
    abnormal: string;
    unit: string;
  };
  sessionKey: string;
  getInitParams: () => {
    gradeId?: string | number;
    subjectId?: string;
    classId?: string;
    locked: boolean;
  };
  fetchStats: (
    scanRecordId: string,
    subjectId: string,
    scanTime: string
  ) => Promise<{
    shouldNum: number;
    actualNum: number;
    errorNum: number;
    lackNum: number;
    abnormalNum: number;
    scannedNum: number;
    duplicateNum: number;
    otherNum: number;
    repeatNum: number;
  }>;
  fetchList: (params: any) => Promise<{ rows: any[]; total: number }>;
  onScanComplete?: (scanRecordId: string) => Promise<void>;
}

const props = defineProps<{ config: ScannerConfig }>();

const userStore = useUserStore();
const paperSizeList = paperSize_list;
const layoutList = [
  { label: "单栏", value: 1 },
  { label: "双栏", value: 2 },
  { label: "三栏", value: 3 },
];

// WebSocket 状态
const wsConnected = ref(false);
const wsConnecting = ref(false);
const wsError = ref(false);
const wsErrorMsg = ref("");

// 扫描进度
const scanningProgress = reactive({
  isScanning: false,
  scannedCount: 0,
  uploadedCount: 0,
  totalCount: 0,
  progress: 0,
  statusText: "",
});

// 禁用状态
const isSubjectDisabled = ref(true);
const isGradeDisabled = ref(true);
const isClassDisabled = ref(true);

// 菜单
const activeMenuIndex = ref(sessionStorage.getItem(props.config.sessionKey) || "1");
const componentMap: Record<string, any> = {
  "1": Should,
  "2": Actual,
  "3": Lack,
  "4": Abnormal,
  "5": Abnormal,
  "6": Repeated,
};
const currentComponent = shallowRef(componentMap[activeMenuIndex.value] || Should);

/** 仅异常子表（学号异常/其他异常）需要传给 Abnormal，避免其它 Tab 收到多余 props */
const abnormalTabExtraProps = computed(() =>
  activeMenuIndex.value === "4" || activeMenuIndex.value === "5"
    ? { resultType: parseInt(activeMenuIndex.value, 10) }
    : {},
);

// 统计数据
const shouldNum = ref(0);
const actualNum = ref(0);
const errorNum = ref(0);
const lackNum = ref(0);
const abnormalNum = ref(0);
const scannedNum = ref(0);
const identified = ref(0);
const duplicateNum = ref(0);
const otherAbnormalNum = ref(0);
const repeatScanNum = ref(0);

// 表格数据
const allTableData = reactive({
  shouldList: [] as any[],
  actualList: [] as any[],
  lackList: [] as any[],
  abnormalList: [] as any[],
  otherAbnormalList: [] as any[],
  repeatList: [] as any[],
});
const tabPagination = reactive<
  Record<number, { pageNum: number; pageSize: number; total: number }>
>({
  1: { pageNum: 1, pageSize: 10, total: 0 },
  2: { pageNum: 1, pageSize: 10, total: 0 },
  3: { pageNum: 1, pageSize: 10, total: 0 },
  4: { pageNum: 1, pageSize: 10, total: 0 },
  5: { pageNum: 1, pageSize: 10, total: 0 },
  6: { pageNum: 1, pageSize: 10, total: 0 },
});

const currentTabTotal = computed(() => tabPagination[parseInt(activeMenuIndex.value)]?.total ?? 0);
const currentTableData = computed(() => {
  const map: Record<string, any[]> = {
    "1": allTableData.shouldList,
    "2": allTableData.actualList,
    "3": allTableData.lackList,
    "4": allTableData.abnormalList,
    "5": allTableData.otherAbnormalList,
    "6": allTableData.repeatList,
  };
  return map[activeMenuIndex.value] ?? [];
});
const currentTableSubtitle = computed(
  () =>
    `共 ${tabPagination[parseInt(activeMenuIndex.value)]?.total ?? 0} 项，当前显示 ${
      currentTableData.value.length
    } 项`,
);
const getScanButtonText = computed(() => {
  if (wsConnecting.value) return "连接中...";
  if (scanningProgress.isScanning) return "扫描中...";
  if (!wsConnected.value) return "连接扫描仪";
  return "开始扫描";
});

// 表单
interface RuleForm {
  scanName: string;
  paperSize: string;
  grade: string | number;
  onePageDoubleQrcode: number;
  class: string;
  subject: string;
  layout: number;
  isMultiPage: boolean;
}
const ruleFormRef = ref<FormInstance>();
const formData = reactive<RuleForm>({
  scanName: "",
  onePageDoubleQrcode: 0,
  paperSize: paperSize_value.value,
  grade: "",
  class: "",
  subject: (subjectDefault.value as string) || "",
  layout: 1,
  isMultiPage: false,
});
const rules = computed<FormRules<RuleForm>>(() => ({
  scanName: [{ required: true, message: "选择一个设备", trigger: "change" }],
  paperSize: [{ required: true, message: "选择纸张大小", trigger: "change" }],
  subject: [{ required: true, message: "选择学科", trigger: "change" }],
  grade: [{ required: true, message: "选择年级", trigger: "change" }],
  // class: [{ required: true, message: "选择班级", trigger: "change" }],
  ...(props.config.showLayout
    ? { layout: [{ required: true, message: "选择栏数", trigger: "change" }] }
    : {}),
}));

// 班级/年级/学科数据
const gradeOptions = ref<any[]>([]);
const classList = ref<any[]>([]);
const subjectData = ref<any[]>([]);
const selectedClassData = ref<any>(null);
const teacherId = ref("");

// 对话框
const dialogFormVisible = ref(false);
const innerVisible = ref(false);

// Loading
let ragRefInstance = ref<any>();
let closeLoadingTimer: ReturnType<typeof setTimeout> | null = null;
let scanResultsRequestSeq = 0;
const loadingFun = () => {
  if (closeLoadingTimer) {
    clearTimeout(closeLoadingTimer);
    closeLoadingTimer = null;
  }
  if (ragRefInstance.value) ragRefInstance.value.close();
  ragRefInstance.value = ElLoading.service({
    body: true,
    text: "扫描中，请不要关闭此页面！",
    lock: true,
  });
  // isLoading.value = true;
};
const closeLoading = () => {
  console.log("closeLoading");
  if (ragRefInstance.value) {
    ragRefInstance.value.close();
    ragRefInstance.value = null;
  }
  // isLoading.value = false;
};
// 是否扫描或者重新识别
const isScanOrReset = ref(false);
// 进度监控
let progressInterval: any = null;
let lastScanTime = 0;
const startProgressMonitoring = () => {
  if (progressInterval) clearInterval(progressInterval);
  progressInterval = setInterval(() => {
    scanningProgress.scannedCount = scanningState.scannedImages || 0;
    scanningProgress.uploadedCount = scanningState.uploadedImages || 0;
    if (scanningProgress.totalCount > 0) {
      scanningProgress.progress = Math.min(
        100,
        Math.floor((scanningProgress.scannedCount / scanningProgress.totalCount) * 100),
      );
    }
    if (scanningProgress.scannedCount > 0) {
      scanningProgress.statusText = `已扫描 ${scanningProgress.scannedCount} 张，已上传 ${scanningProgress.uploadedCount} 张`;
    }
    if (!scanningState.isScanning && scanningProgress.isScanning) {
      scanningProgress.isScanning = false;
      scanningProgress.statusText = "扫描完成";
      scanningProgress.progress = 100;
      // setTimeout(() => {
      //   console.log("startProgressMonitoring扫描完成准备关闭Loading");
      //   if (ragRefInstance.value) closeLoading();
      // }, 1000);
    }
    if (scanningProgress.isScanning && lastScanTime && Date.now() - lastScanTime > 30000) {
      scanningProgress.isScanning = false;
      scanningProgress.statusText = "扫描超时";
      closeLoading();
      clearInterval(progressInterval);
      progressInterval = null;
    }

  }, 1000);
};

watch(
  () => scanningState.scannedImages,
  n => {
    if (n > 0) lastScanTime = Date.now();
  },
);

// WebSocket
const openClient = async () => {
  wsConnecting.value = true;
  wsError.value = false;
  await initBWebSocket();
};
const reconnectWebSocket = async () => {
  if (!wsConnecting.value) await openClient();
};

watch(
  () => [
    wsConnectionState.connected,
    wsConnectionState.error,
    wsConnectionState.connecting,
    devices.value.length,
  ],
  ([connected, error, connecting, deviceCount]) => {
    if (connecting) {
      wsConnecting.value = true;
      wsError.value = false;
    }
    if (connected && (deviceCount as number) > 0) {
      wsConnected.value = true;
      wsConnecting.value = false;
      wsError.value = false;
      if (
        (!formData.scanName || !(devices.value as string[]).includes(formData.scanName)) &&
        (devices.value as string[]).length > 0
      )
        formData.scanName = (devices.value as string[])[0];
    } else if (error && !connecting) {
      wsConnected.value = false;
      wsConnecting.value = false;
      wsError.value = true;
      wsErrorMsg.value = wsConnectionState.errorMessage || "连接扫描仪失败";
    }
  },
  { immediate: true },
);

// 初始化表单默认值
const initDefaultScanSettings = () => {
  if ((devices.value as string[]).length > 0) {
    const selectedDevice = (devices.value as string[]).includes(formData.scanName)
      ? formData.scanName
      : (devices.value as string[])[0];
    formData.scanName = selectedDevice;
    if (deviceName.value !== selectedDevice || !deviceOpened.value) {
      deviceName.value = selectedDevice;
      onDeviceChanged(selectedDevice);
    }
  } else {
    formData.scanName = "";
  }
  formData.onePageDoubleQrcode = 0;
  formData.paperSize = "A4";
  formData.isMultiPage = false;
  const init = props.config.getInitParams();
  if (init.gradeId) formData.grade = init.gradeId;
  if (init.subjectId) formData.subject = init.subjectId || "";
  if (init.classId) formData.class = init.classId || "";
  isSubjectDisabled.value = init.locked;
  isGradeDisabled.value = init.locked;
  isClassDisabled.value = init.locked;
  if (formData.grade) getClassList();
};

// 班级/年级操作
const changeGrade = () => {
  formData.class = "";
  selectedClassData.value = null;
  getClassList();
};
const onClassChange = (val: string) => {
  const target = classList.value.find((c: any) => c.id === val);
  selectedClassData.value = target
    ? { ...target, academicYear: target.academicYear || userStore.academicYearId }
    : null;
};
const getClassList = async () => {
  try {
    const res: any = await classListAuth({
      createDept: userStore.deptId,
      teacherId: userStore.identityId,
      academicYear: userStore.academicYearId,
      roleId: userStore.roleId,
      gradeId: formData.grade,
    });
    if (res.code === 200) {
      classList.value = [
        ...(res.data?.adminClasses || []),
        ...(res.data?.teachClasses || res.data?.teachclasses || []),
      ];
      if (classList.value.length > 0) {
        if (!formData.class) {
          formData.class = classList.value[0].id;
          selectedClassData.value = classList.value[0];
        } else {
          const found = classList.value.find((c: any) => c.id === formData.class);
          if (found) selectedClassData.value = found;
          else {
            formData.class = classList.value[0].id;
            selectedClassData.value = classList.value[0];
          }
        }
      } else {
        formData.class = "";
        selectedClassData.value = null;
      }
    }
  } catch (e) {
    console.error("获取班级列表出错:", e);
  }
};
const handleOtherSubject = () => {
  isSubjectDisabled.value = false;
};
const handleOtherClass = () => {
  isGradeDisabled.value = false;
  isClassDisabled.value = false;
  getClassList();
};

// 扫描流程
const openDialog = () => {
  if (!wsConnected.value) {
    ElMessage.warning("请先连接扫描仪");
    reconnectWebSocket();
    return;
  }
  initDefaultScanSettings();
  dialogFormVisible.value = true;
};
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(valid => {
    if (valid) innerVisible.value = true;
  });
};
const onchangeDevide = (val: any) => {
  deviceName.value = val;
  onDeviceChanged(val);
};
const onChangePaperSize = (val: any) => {
  formData.paperSize = val;
};
const isShowdialog = () => {
  innerVisible.value = false;
  dialogFormVisible.value = false;
  if (!deviceOpened.value) {
    ElMessage.warning("设备未就绪，请检查扫描仪连接");
    return;
  }
  setGlobalConfig({
    file_save_path: "C:\\",
    file_name_prefix: "Doc",
    file_name_mode: "folder_time_img_order",
    image_format: "jpg",
    image_jpeg_quality: 80,
    image_tiff_compression: "lzw",
    image_tiff_jpeg_quality: 80,
  });
  setScanParams([{ name: "纸张尺寸", value: formData.paperSize }]);
  scanningProgress.isScanning = true;
  scanningProgress.progress = 0;
  scanningProgress.statusText = "正在连接扫描仪...";
  // closeLoading();
  loadingFun();
  isLoading.value = true;
  const currentGrade = gradeOptions.value.find((g: any) => g.gradeId == formData.grade);
  const realBatchId = SnowflakeIdGenerator.generateId();
  startScan(
    String(formData.grade),
    formData.class,
    "",
    formData.subject,
    props.config.name,
    teacherId.value,
    selectedClassData.value,
    props.config.mode,
    props.config.mode === "exam" ? String(props.config.examProcessId || "") : "",
    currentGrade?.periodId || "",
    props.config.mode === "exam" ? String(props.config.examInfoId || "") : "",
    "",
    formData.layout,
    formData.paperSize,
    formData.isMultiPage,
    props.config.scanType || "",
    formData.onePageDoubleQrcode,
    realBatchId,
  );
  startProgressMonitoring();
  isScanOrReset.value = true;
};

// 数据加载
const fetchTabData = (type: number, pageNum?: number, pageSize?: number) => {
  if (!recordId.value) return Promise.resolve();
  const pagination = tabPagination[type];
  if (!pagination) return Promise.resolve();
  const pn = pageNum ?? pagination.pageNum;
  const ps = pageSize ?? pagination.pageSize;
  const params: any = {
    resultType: type,
    id: recordId.value,
    pageNum: pn,
    pageSize: ps,
        scanTime: route.query?.scanTime ? decodeURIComponent(route.query.scanTime as string) : undefined,
  };
  if ((type === 1 || type === 3) && formData.class) params.classId = formData.class;
  if (props.config.mode === "exam" && props.config.examInfoId)
    params.examMainId = props.config.examInfoId;
    params.examProcessId = props.config.examProcessId;
  if (currentSearchName.value) params.studentName = currentSearchName.value;
  return props.config
    .fetchList(params)
    .then(res => {
      pagination.total = res.total || 0;
      pagination.pageNum = pn;
      pagination.pageSize = ps;

      // 替换为缓存的学生
      loadTempEditStudent(res.rows)

      const listMap: Record<number, keyof typeof allTableData> = {
        1: "shouldList",
        2: "actualList",
        3: "lackList",
        4: "abnormalList",
        5: "otherAbnormalList",
        6: "repeatList",
      };
      if (listMap[type]) (allTableData as any)[listMap[type]] = res.rows || [];

    })
    .catch(err => console.error("获取列表失败", err));
};

/**
 * 加载缓存的修改学生
 */
const loadTempEditStudent = (rows: any[]): void => {
  if (!rows?.length) return;

  const assignInfoStr = localStorage.getItem("scannerAssignInfoList");
  if (!assignInfoStr) return;
  
  try {
    const assignInfo = JSON.parse(assignInfoStr);
    if (!Array.isArray(assignInfo)) return;

    // 只对有 errorsId 的 row 建索引
    const rowIndexMap = new Map<string, number>(
        rows
            .map((item, index) => [item.errorsId, index] as [string, number])
            .filter(([errorsId]) => errorsId != null)
    );

    for (const ele of assignInfo) {
      if (!ele?.newStudentCode) continue;

      const targetIndex = rowIndexMap.get(ele.errorsId);
      if (targetIndex !== undefined) {
        console.log("【调试】更换的错误记录 ID:", ele.errorsId);
        console.log("【调试】更新之前的数据:", JSON.parse(JSON.stringify(rows))); // 深拷贝打印，避免引用干扰
        (rows[targetIndex] as any).studentCode = ele.newStudentCode;
        (rows[targetIndex] as any).studentName = ele.newStudentName;
        console.log("【调试】更新之后的数据:", JSON.parse(JSON.stringify(rows)));
      }
    }
  } catch (e) {
    console.error("解析分配信息失败:", e);
  }
};

const loadScanResults = async (id: string) => {
  console.log("loadScanResults.........................");

  if (!id) return;
  const requestSeq = ++scanResultsRequestSeq;
  const shouldPollWhileLoading = isScanOrReset.value;

  scanningProgress.isScanning = false;
  scanningProgress.statusText = "扫描完成，正在获取结果...";
  scanningProgress.progress = 100;

  if (props.config.onScanComplete) await props.config.onScanComplete(id).catch(console.error);
  if (requestSeq !== scanResultsRequestSeq || recordId.value !== id) return;

  const MAX_RETRIES = 20;
  const INTERVAL = 2000;
  let lastScannedNum = -1;
  let stableCount = 0;

  const updateStats = (stats: any) => {
    shouldNum.value = stats.shouldNum;
    actualNum.value = stats.actualNum;
    errorNum.value = stats.errorNum || 0;
    lackNum.value = stats.lackNum;
    abnormalNum.value = stats.abnormalNum;
    scannedNum.value = stats.scannedNum;
    identified.value = stats.scannedNum;
    duplicateNum.value = stats.duplicateNum;
    otherAbnormalNum.value = stats.otherNum;
    repeatScanNum.value = stats.repeatNum;
  };
  const refreshCurrentTab = () => fetchTabData(parseInt(activeMenuIndex.value));

  if (shouldPollWhileLoading) {
    for (let i = 0; i < MAX_RETRIES; i++) {
      const stats = await props.config.fetchStats(
        id,
        formData.subject,
        route.query?.scanTime ? decodeURIComponent(route.query.scanTime as string) : undefined
      ).catch(() => null);
      if (requestSeq !== scanResultsRequestSeq || recordId.value !== id) return;

      if (!stats) {
        if (!isLoading.value) break;
        await new Promise(resolve => setTimeout(resolve, INTERVAL));
        continue;
      }

      updateStats(stats);
      scanningProgress.statusText = `正在处理结果，已识别 ${stats.scannedNum} 张...`;

      const current = stats.scannedNum ?? 0;
      if (current > 0 && current === lastScannedNum) {
        stableCount++;
        if (stableCount >= 2) break;
      } else {
        stableCount = 0;
      }
      lastScannedNum = current;

      if (!isLoading.value) break;
      await new Promise(resolve => setTimeout(resolve, INTERVAL));
      if (requestSeq !== scanResultsRequestSeq || recordId.value !== id) return;
    }
  } else {
    const stats = await props.config
      .fetchStats(
        id,
        formData.subject,
        route.query?.scanTime ? decodeURIComponent(route.query.scanTime as string) : undefined,
      )
      .catch(() => null);
    if (requestSeq !== scanResultsRequestSeq || recordId.value !== id) return;
    if (stats) {
      updateStats(stats);
      scanningProgress.statusText = `正在处理结果，已识别 ${stats.scannedNum} 张...`;
    }
  }

  isScanOrReset.value = false;
  refreshCurrentTab();
};

const currentSearchName = ref("");

const onTabSearch = (name: string) => {
  currentSearchName.value = name;
  fetchTabData(parseInt(activeMenuIndex.value), 1);
};

const refreshTableData = () => {
  console.log("refreshTableData....................");
  if (!recordId.value) return;
  fetchTabData(parseInt(activeMenuIndex.value));
};
// 刷新数据
const refreshAllData = async () => {
  if (!recordId.value) return;

  setTimeout(async () => {
    // 1. 重新获取统计数据 (更新菜单数字)
    const stats = await props.config.fetchStats(recordId.value, formData.subject).catch(() => null);
    if (stats) {
      shouldNum.value = stats.shouldNum;
      actualNum.value = stats.actualNum;
      errorNum.value = stats.errorNum || 0;
      lackNum.value = stats.lackNum;
      abnormalNum.value = stats.abnormalNum;
      duplicateNum.value = stats.duplicateNum;
      otherAbnormalNum.value = stats.otherNum;
      repeatScanNum.value = stats.repeatNum;
    }
    // 2. 刷新当前表格列表 (更新表格内容)
    fetchTabData(parseInt(activeMenuIndex.value));
  }, 2000)
};




const onTabPageChange = (pageNum: number, pageSize: number) => {
  fetchTabData(parseInt(activeMenuIndex.value), pageNum, pageSize);
};
const handleMenuSelect = (index: string) => {
  activeMenuIndex.value = index;
  currentComponent.value = componentMap[index] || Should;
  sessionStorage.setItem(props.config.sessionKey, index);
  currentSearchName.value = "";
  if (recordId.value) fetchTabData(parseInt(index));
};

const getQueryValue = (value: unknown) => (Array.isArray(value) ? value[0] : value);

watch(
  recordId,
  async (newVal, oldVal) => {
    if (!newVal || newVal === oldVal) return;

    await loadScanResults(newVal);
    if (recordId.value !== newVal) return;

    const selectedClassId = formData.class || undefined;
    const selectedSubjectId = formData.subject || undefined;

    if (
      getQueryValue(route.query.id) !== newVal ||
      getQueryValue(route.query.classId) !== selectedClassId ||
      getQueryValue(route.query.subjectId) !== selectedSubjectId
    ) {
      router.replace({
        query: {
          ...route.query,
          id: newVal,
          classId: selectedClassId,
          subjectId: selectedSubjectId,
        },
      });
    }
  },
  { immediate: true },
);

watch(isClose, newVal => {
  if (!newVal) return;
  console.log("isClose.........................", newVal);
  // closeLoading();
  if (msg.value.includes("成功") || msg.value.includes("完成")) {
    ElMessage.success(msg.value || "扫描完成,开始上传中");
    scanningProgress.isScanning = false;
    scanningProgress.statusText = "扫描完成";
    scanningProgress.progress = 100;
  } else if (msg.value.includes("失败") || msg.value.includes("错误")) {
    ElMessage.error(msg.value || "扫描失败");
    scanningProgress.isScanning = false;
    scanningProgress.statusText = "扫描失败";
    closeLoading()
  } else if (msg.value.includes("无纸")) {
    ElMessage.error(msg.value || "无纸");
    scanningProgress.isScanning = false;
    scanningProgress.statusText = "无纸";
    closeLoading()
  } else if (msg.value) {
    ElMessage.info(msg.value);
  } else {
    scanningProgress.isScanning = false;
    scanningProgress.statusText = "扫描完成";
    scanningProgress.progress = 100;
  }
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
});

// isLoading 变 false 时关遮罩（单向驱动）
watch(
    isLoading,
    (newVal) => {
      console.log(">>>>>>>>> isLoading 发生变化，当前值:", newVal);
      // 当 isLoading 变为 false 时触发关闭逻辑
      if (!newVal) {
        console.log(">>>>>>>>> isLoading 已变为 false，准备关闭遮罩");
        if (closeLoadingTimer) clearTimeout(closeLoadingTimer);
        closeLoadingTimer = setTimeout(() => {
          closeLoading();
        }, 5000);
      } else if (closeLoadingTimer) {
        clearTimeout(closeLoadingTimer);
        closeLoadingTimer = null;
      }
    },
    {
      immediate: true // 【关键】立即执行一次，防止漏掉初始状态或快速变化的状态
    }
);


const route = useRoute();

watch(
  () => route.query,
  v => {
    if (v?.id) {
      recordId.value = String(v.id);
    }
  },
  {
    immediate: true,
    deep: true,
  },
);

const goBack = () => window.history.back();

getInfo().then(res => {
  teacherId.value = res.data.user.identityId;
  const services = userStore.rawData?.academicYear?.[0]?.services || [];
  const gradeMap = new Map<string, any>();
  services.forEach((s: any) => {
    if (s.gradeId && !gradeMap.has(s.gradeId))
      gradeMap.set(s.gradeId, { gradeId: s.gradeId, gradeName: s.gradeName, periodId: s.periodId });
  });
  gradeOptions.value = Array.from(gradeMap.values());
  getClassList();
});

getDicts("sys_subject").then(res => {
  if ((res as any).code === 200) subjectData.value = res.data;
});

onMounted(() => {
  openClient();
  initDefaultScanSettings();
});


onUnmounted(() => {
});
onBeforeUnmount(() => {
  scanResultsRequestSeq++;
  recordId.value = "";
  if (closeLoadingTimer) {
    clearTimeout(closeLoadingTimer);
    closeLoadingTimer = null;
  }
  if (progressInterval) clearInterval(progressInterval);
  closeLoading();
  cleanupWebSocket();
});
</script>

<style scoped lang="scss">
.connection-status {
  margin-bottom: 20px;
}

.scanning-progress {
  margin: 20px 0;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;

  .progress-text {
    margin-top: 10px;
    text-align: center;
    color: #666;
    font-size: 14px;
  }
}

.header {
  width: 100%;
  height: 84px;
  display: flex;
  justify-content: center;
  background: #ffffff;
  box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.2);
  border-radius: 10px 10px 0px 0px;
  margin-top: 20px;
}

.header-l {
  float: left;
  width: 30%;
  cursor: pointer;
  margin-top: 26px;
  margin-left: 21px;
  flex: 1;

  div {
    width: 120px;
    height: 32px;
    background: #e8e8e8;
    border-radius: 4px;
    display: flex;

    img {
      width: 24px;
      height: 24px;
      margin-top: 4px;
      margin-left: 8px;
    }

    span {
      font-weight: 700;
      font-size: 14px;
      color: #171717;
      line-height: 24px;
      margin-top: 5px;
    }
  }
}

.header-c {
  float: left;
  width: auto;
  text-align: center;
  flex: 1;
  margin-top: 16px;

  .header-c-title {
    font-weight: 500;
    font-size: 18px;
    color: #333333;
    line-height: 26px;
  }

  .header-c-des {
    margin-top: 4px;

    .span1,
    .span2,
    .span3 {
      height: 22px;
      font-weight: 400;
      font-size: 14px;
      color: #666666;
      line-height: 22px;
    }

    .span2 {
      margin: 0 40px;
    }
  }
}

.header-r {
  float: right;
  width: 20%;
  text-align: right;
  flex: 1;

  button {
    margin-top: 26px;
    margin-right: 20px;
    width: 120px;
    height: 32px;
  }
}

.content {
  display: flex;
  margin: 20px 0;
  gap: 20px;
}

.content-left {
  width: 20%;
  height: 726px;
  background: #fff;
  box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  padding: 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  .menu-container {
    flex: 1;
    overflow-y: auto;
  }

  :deep(.custom-menu) {
    background-color: transparent;
    border-right: none;

    .el-menu-item,
    .el-sub-menu__title {
      height: 40px;
      line-height: 40px;
      margin-bottom: 4px;
      border-radius: 4px;
      color: #606266;
      font-size: 14px;
      background-color: transparent;

      &:hover {
        background-color: rgba(64, 158, 255, 0.1);
      }
    }

    .el-menu-item.is-active {
      background-color: #e1f0ff;
      color: #409eff;
      border: 1px solid #409eff;
      font-weight: 500;
    }

    .el-sub-menu.is-active {
      .el-sub-menu__title {
        color: #409eff;
      }
    }
  }
}

.content-right-header {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;

  .content-right-header-l,
  .content-right-header-c,
  .content-right-header-r {
    flex: 1;
    min-width: 0;
    height: 105px;
    background: #ffffff;
    border-radius: 12px;
    display: flex;
    align-items: center;
    padding: 0 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border: 1px solid #f0f0f0;

    > div {
      flex: 1;

      .num {
        font-size: 36px;
        font-weight: 700;
        color: #333;
        line-height: 1;
      }

      .fh {
        font-size: 18px;
        color: #999;
        margin-left: 12px;
      }

      .scan {
        margin-top: 8px;
        height: 24px;
        display: inline-flex;
        align-items: center;
        padding: 0 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;

        span {
          line-height: 1;
        }
      }
    }

    img {
      width: 120px;
      margin-left: auto;
    }
  }
}

.content-right-table {
  width: 100%;
  background: #ffffff;
  box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  margin: 20px 0;
}

.dialog-footer {
  text-align: center;
}

:deep(.scan-setting-dialog) {
  border-radius: 8px;

  .el-dialog__header {
    margin-right: 0;
    padding: 20px 24px;
    border-bottom: 1px solid #f0f0f0;

    .el-dialog__title {
      font-weight: 500;
      font-size: 16px;
      color: #333;
    }
  }

  .el-dialog__body {
    padding: 24px 40px;
  }
}

:deep(.custom-scan-form) {
  .el-form-item__label {
    color: #606266;
    padding-bottom: 8px;
    line-height: 1.2;
  }

  .el-form-item {
    margin-bottom: 20px;
  }
}

:deep(.white-input) {
  .el-input__wrapper {
    box-shadow: 0 0 0 1px #dcdfe6 inset;

    &:hover {
      box-shadow: 0 0 0 1px #c0c4cc inset;
    }

    &.is-focus {
      box-shadow: 0 0 0 1px #409eff inset;
    }
  }
}

:deep(.gray-display-input.el-select--disabled) {
  .el-input__wrapper {
    background-color: #f5f7fa;
    box-shadow: none !important;
    border-radius: 4px;

    .el-input__inner {
      color: #333;
      text-align: center;
      -webkit-text-fill-color: #333;
      cursor: default;
    }

    .el-select__suffix {
      display: none;
    }
  }
}

.select-trigger-btn {
  width: 120px;
  border-color: #3c7eff;
  color: #3c7eff;
  background-color: #fff;
  box-shadow: 0px 2px 6px 0px rgba(60, 126, 255, 0.15);

  &:hover {
    color: #3c7eff;
    border-color: #3c7eff;
    background-color: #fff;
    opacity: 0.8;
  }
}

.dialog-action-area {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  gap: 20px;

  .el-button {
    width: 120px;
    height: 40px;
    border-radius: 4px;
  }

  .footer-confirm-btn {
    background-color: #0052d9;
    border-color: #0052d9;

    &:hover {
      opacity: 0.9;
    }
  }

  .footer-cancel-btn {
    color: #0052d9;
    border-color: #0052d9;
    background-color: #fff;

    &:hover {
      background-color: #ecf5ff;
    }
  }
}

.inner-msg {
  text-align: center;
  padding: 10px 0;
}
</style>
