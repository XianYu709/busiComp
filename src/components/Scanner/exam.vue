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
          <span>返回上一步</span>
        </div>
      </div>
      <div class="header-c">
        <span class="header-c-title">扫描答卷</span>
        <div class="header-c-des">
          <span class="span1">考试名称：{{ examInfoName }}</span>
          <span class="span2">年级：{{ gradeName }}</span>
          <span class="span3">学科：{{ subjectName }}</span>
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
                <span>应考（{{ shouldNum }}）</span>
              </template>
            </el-menu-item>

            <el-menu-item index="2">
              <template #title>
                <span>实考（{{ actualNum }}）</span>
              </template>
            </el-menu-item>
            <el-menu-item index="3">
              <template #title>
                <span>缺少考卷（{{ lackNum }}）</span>
              </template>
            </el-menu-item>
            <el-sub-menu>
              <template #title>
                <span>异常考卷（{{ abnormalNum }}）</span>
              </template>
              <el-menu-item index="4">学号重复（{{ duplicateNum }}）</el-menu-item>
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
              <span class="num">{{ scannedNum }}</span>
              <span class="fh">张</span>
              <p class="scan bg-#E7EFF9 ml-2"><span class="ysm color-#0E5FC7">已扫描</span></p>
            </div>
            <img src="./images/239(1).png" alt="" />
          </div>

          <div class="content-right-header-c">
            <div>
              <span class="num">{{ identified }}</span>
              <span class="fh">张</span>
              <p class="scan bg-#E9F6F3 ml-2"><span class="ysm color-#20A28B">已识别</span></p>
            </div>
            <img src="./images/ysb.png" alt="" />
          </div>

          <div class="content-right-header-r">
            <div>
              <span class="num">{{ abnormalNum }}</span>
              <span class="fh">个</span>
              <p class="scan bg-#FDE8E8 ml-2"><span class="color-#EB1919">异常考卷</span></p>
            </div>
            <img src="./images/239(2).png" alt="" />
          </div>
        </div>

        <div class="content-right-table">
          <component
            :is="currentComponent"
            message="exam"
            :record-id="recordId"
            :list-data="currentTableData"
            :subtitle="currentTableSubtitle"
            v-bind="currentLabelProps"
            :examInfoId="examInfoId"
            :subjectId="subjectId"></component>
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

        <el-form-item label="选择栏数" prop="layout">
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

        <el-form-item label="选择对应页数" prop="isMultiPage">
          <el-select
            v-model="formData.isMultiPage"
            placeholder="请选择"
            style="width: 100%"
            class="white-input">
            <el-option label="单份考试-单页" :value="false" />
            <el-option label="多份考试-多页" :value="true" />
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
              v-for="item in adminClasses"
              :key="item.gradeId"
              :label="item.gradeName"
              :value="item.gradeId" />
          </el-select>
        </el-form-item>

        <el-form-item label="选择班级" prop="class">
          <div class="flex w-100% gap-15px">
            <el-select
              v-model="formData.class"
              placeholder="请选择班级"
              :disabled="isClassDisabled || !formData.grade"
              no-data-text="该年级下暂无班级"
              class="gray-display-input flex-1"
              @change="onClassChange">
              <el-option
                v-for="item in classes"
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
        <div class="inner-msg">确认提交扫描设置吗？</div>
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
  classType,
  scanningState,
  classId,
  wsConnectionState,
} from "./js/scanWeb";
// 纸张大小列表
const paperSizeList = paperSize_list;

const layoutList = [
  { label: "单栏", value: 1 },
  { label: "双栏", value: 2 },
  { label: "三栏", value: 3 },
];

// 扫描参数
const scanParams = new Array();

import {
  getDicts,
  getInfo,
  getExamProgress,
  classListAuth,
  getCompleteScan,
  examWsScanRepeat,
  getExamScanStatistics,
  getExamScanList,
  getScanRecordExam,
} from "./api/scan";
import { useRoute } from "vue-router";
import { useUserStore } from "@apps/core/store/modules/user";

const route = useRoute();
const userStore = useUserStore();

const initPage = () => {
  // 确保使用最新的 route query
  const pId = route.query.examProcessId;
  if (pId) {
    // 先清空，防止显示旧数据
    recordId.value = "";
    getScanRecordExam(pId as string).then((res: any) => {
      // 如果返回了recordId, 则获取页面数据
      if (res.data && res.data.id) {
        recordId.value = res.data.id;
        // 强制调用一次，确保即使recordId未变化也能刷新数据
        loadScanResults(res.data.id);
      }
    });
  }
};

const isFirstLoad = ref(true);

onMounted(() => {
  initPage();
});

onActivated(() => {
  if (isFirstLoad.value) {
    isFirstLoad.value = false;
    return;
  }
  initPage();
});

// --- WebSocket连接状态 ---
const wsConnected = ref(false);
const wsConnecting = ref(false);
const wsError = ref(false);
const wsErrorMsg = ref("");

// --- 扫描进度状态 ---
const scanningProgress = reactive({
  isScanning: false,
  scannedCount: 0,
  uploadedCount: 0,
  totalCount: 0,
  progress: 0,
  statusText: "",
});

// --- 控制禁用状态 ---
const isSubjectDisabled = ref(true);
const isClassDisabled = ref(true);
const isGradeDisabled = ref(true);

// --- 菜单状态和组件映射 ---
const activeMenuIndex = ref(sessionStorage.getItem("scanner_exam_active_tab") || "1");
const componentMap: Record<string, any> = {
  "1": Should,
  "2": Actual,
  "3": Lack,
  "4": Abnormal,
  "5": Other,
  "6": Repeated,
};
const currentComponent = shallowRef(componentMap[activeMenuIndex.value] || Should);

// --- 统计数据 ---
const shouldNum = ref(0);
const actualNum = ref(0);
const lackNum = ref(0);
const abnormalNum = ref(0);
const scannedNum = ref(0);
const identified = ref(0);
const duplicateNum = ref(0);
const otherAbnormalNum = ref(0);
const repeatScanNum = ref(0);

// --- 路由参数 ---
const examInfoName = computed(() => (route.query.examInfoName as string) || "");
const examInfoId = computed(() => route.query.examInfoId);
const paperGenMethod = computed(() => route.query.paperGenMethod);
const examProcessId = computed(() => route.query.examProcessId);
const periodId = computed(() => route.query.periodId);
const examProcessTemplateInstId = computed(() => route.query.examProcessTemplateInstId);
const gradeName = computed(() => (route.query.gradeName as string) || "");
const gradeId = computed(() => (route.query.gradeId as string) || "");
const subjectName = computed(() => (route.query.subjectName as string) || "");
const subjectId = computed(() => route.query.subjectId);

// --- 表单数据 ---
interface RuleForm {
  scanName: string;
  paperSize: string;
  grade: number | string;
  class: string;
  subject: string;
  layout: number;
  isMultiPage: boolean;
}

const ruleFormRef = ref<FormInstance>();
const formData = reactive<RuleForm>({
  scanName: "",
  paperSize: paperSize_value.value,
  grade: Number(gradeId.value) || "",
  class: "",
  subject: (subjectId.value as string) || "",
  layout: 1,
  isMultiPage: false,
});

const rules = reactive<FormRules<RuleForm>>({
  scanName: [{ required: true, message: "选择一个设备", trigger: "change" }],
  paperSize: [{ required: true, message: "选择纸张大小", trigger: "change" }],
  subject: [{ required: true, message: "选择学科", trigger: "change" }],
  grade: [{ required: true, message: "选择年级", trigger: "change" }],
  class: [{ required: true, message: "选择班级", trigger: "change" }],
  layout: [{ required: true, message: "选择栏数", trigger: "change" }],
  isMultiPage: [{ required: true, message: "选择页数", trigger: "change" }],
});

// --- 数据列表 ---
const grades = ref<any[]>([]);
const classes = ref<any[]>([]);
const subjectData = ref<any[]>([]);
const allTableData = reactive({
  shouldList: [],
  actualList: [],
  lackList: [],
  abnormalList: [],
  otherAbnormalList: [],
  repeatList: [],
});

const currentTableData = computed(() => {
  switch (activeMenuIndex.value) {
    case "1":
      return allTableData.shouldList;
    case "2":
      return allTableData.actualList;
    case "3":
      return allTableData.lackList;
    case "4":
      return allTableData.abnormalList;
    case "5":
      return allTableData.otherAbnormalList;
    case "6":
      return allTableData.repeatList;
    default:
      return [];
  }
});

const currentTableSubtitle = computed(() => {
  let count = 0;
  let total = 0;
  switch (activeMenuIndex.value) {
    case "1":
      count = allTableData.shouldList.length;
      total = shouldNum.value;
      break;
    case "2":
      count = allTableData.actualList.length;
      total = actualNum.value;
      break;
    case "3":
      count = allTableData.lackList.length;
      total = lackNum.value;
      break;
    case "4":
      count = allTableData.abnormalList.length;
      total = duplicateNum.value;
      break;
    case "5":
      count = allTableData.otherAbnormalList.length;
      total = otherAbnormalNum.value;
      break;
    case "6":
      count = allTableData.repeatList.length;
      total = repeatScanNum.value;
      break;
  }
  return `共 ${total} 项，当前显示 ${count} 项`;
});

const getScanButtonText = computed(() => {
  if (wsConnecting.value) return "连接中...";
  if (scanningProgress.isScanning) return "扫描中...";
  if (!wsConnected.value) return "连接扫描仪";
  return "开始扫描";
});

const currentLabelProps = computed(() => {
  switch (activeMenuIndex.value) {
    case "1":
      return { shouldLabel: "应考" };
    case "2":
      return { actualLabel: "实考" };
    case "3":
      return { lackLabel: "缺少考卷" };
    case "4":
      return { abnormalLabel: "学号重复" };
    case "5":
      return { otherLabel: "其他异常" };
    case "6":
      return { repeatedLabel: "重复扫描" };
    default:
      return {};
  }
});

// --- 逻辑处理 ---
const goBack = () => window.history.back();

const handleMenuSelect = (index: string) => {
  activeMenuIndex.value = index;
  const component = componentMap[index];
  if (component) {
    currentComponent.value = component;
    sessionStorage.setItem("scanner_exam_active_tab", index);
  }
  if (recordId.value) {
    refreshTableData();
  }
};

const refreshTableData = () => {
  if (!recordId.value) return;
  const currentType = parseInt(activeMenuIndex.value);
  if (currentType) {
    getExamScanList({
      id: recordId.value,
      examMainId: examInfoId.value,
      resultType: currentType,
    }).then((res: any) => {
      const list = res.rows || res.row || [];

      switch (currentType) {
        case 1:
          allTableData.shouldList = list;
          break;
        case 2:
          allTableData.actualList = list;
          break;
        case 3:
          allTableData.lackList = list;
          break;
        case 4:
          allTableData.abnormalList = list;
          break;
        case 5:
          allTableData.otherAbnormalList = list;
          break;
        case 6:
          allTableData.repeatList = list;
          break;
      }
      // 更新异常汇总
      abnormalNum.value = duplicateNum.value + otherAbnormalNum.value;
    });
  }
};

const openClient = async () => {
  wsConnecting.value = true;
  wsError.value = false;
  wsConnected.value = false;
  devices.value = []; // Reset devices

  await initBWebSocket();
};

// Auto-detect connection success
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
    } else {
      // 只要不在连接中，就停止loading
      wsConnecting.value = false;

      if (connected) {
        wsConnected.value = true;
        wsError.value = false;

        if ((deviceCount as number) > 0) {
          // Debounce success message slightly if needed, or just show it
          // 避免重复提示，可以加个判断或者由上层控制，这里简单保留
          // ElMessage.success("扫描仪连接成功");
          console.log("Devices found:", devices.value);
          // 设置默认设备
          if (!formData.scanName && (devices.value as string[]).length > 0) {
            formData.scanName = (devices.value as string[])[0];
          }
        } else {
          // Connected but no devices found yet
          console.log("Service connected, waiting for devices or no devices found.");
        }
      } else if (error) {
        wsError.value = true;
        wsConnected.value = false;
        wsErrorMsg.value = "连接扫描仪失败";
      }
    }
  },
  { deep: true, immediate: true },
);

const reconnectWebSocket = () => !wsConnecting.value && openClient();

const openDialog = () => {
  if (!wsConnected.value) {
    ElMessage.warning("请先连接扫描仪");
    reconnectWebSocket();
    return;
  }
  // 重置表单选择
  if (devices.value && devices.value.length > 0) {
    formData.scanName = (devices.value as string[])[0];
    if (formData.scanName) {
      deviceName.value = formData.scanName;
      onDeviceChanged(formData.scanName);
    }
  } else {
    formData.scanName = "";
  }
  formData.paperSize = "A4";

  // 重置禁用状态
  isSubjectDisabled.value = true;
  isGradeDisabled.value = true;
  isClassDisabled.value = true;

  // 重置回默认数据
  formData.grade = Number(gradeId.value) || "";
  formData.subject = (subjectId.value as string) || "";
  formData.class = "";

  // 重新获取班级列表 (会自动选择第一个班级)
  getClassList();

  dialogFormVisible.value = true;
};

const dialogFormVisible = ref(false);
const innerVisible = ref(false);

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
  scanParams.push({
    name: "纸张尺寸",
    value: formData.paperSize,
  });
};

const isShowdialog = () => {
  innerVisible.value = false;
  dialogFormVisible.value = false;
  if (deviceOpened.value) {
    setGlobalConfig({
      file_save_path: "C:\\",
      file_name_prefix: "Doc",
      file_name_mode: "folder_time_img_order",
      image_format: "jpg",
      image_jpeg_quality: 80,
      image_tiff_compression: "",
      image_tiff_jpeg_quality: 0,
    });
    setScanParams(scanParams);
    startScanningProcess();
  }
};

const startScanningProcess = () => {
  scanningProgress.isScanning = true;
  scanningProgress.statusText = "正在准备扫描...";
  loadingFun();
  startScan(
    String(formData.grade),
    formData.class,
    "", // classOptions (class name or additional info)
    formData.subject,
    examInfoName.value,
    teacherId.value,
    selectedClassData.value, // classDataObj
    "exam",
    String(examProcessId.value || ""),
    String(periodId.value || ""),
    String(examInfoId.value || ""),
    String(paperGenMethod.value || ""),
    formData.layout,
    formData.paperSize,
    formData.isMultiPage,
  );
  startProgressMonitoring();
};

let progressInterval: any = null;
const startProgressMonitoring = () => {
  if (progressInterval) clearInterval(progressInterval);
  progressInterval = setInterval(() => {
    scanningProgress.scannedCount = scanningState.scannedImages || 0;
    scanningProgress.uploadedCount = scanningState.uploadedImages || 0;
    scanningProgress.statusText = `已扫描 ${scanningProgress.scannedCount} 张，已上传 ${scanningProgress.uploadedCount} 张`;

    if (!scanningState.isScanning && scanningProgress.isScanning) {
      scanningProgress.isScanning = false;
      scanningProgress.statusText = "扫描完成";
      closeLoading();
      if (recordId.value) {
        loadScanResults(recordId.value);
      }
    }
  }, 1000);
};

const teacherId = ref("");
getInfo().then(res => {
  teacherId.value = res.data.user.identityId;
  getClassList();
});

const adminClasses = userStore.rawData.academicYear[0].services;

// 班级选择
const getClassList = async () => {
  try {
    const response: any = await classListAuth({
      createDept: userStore.deptId,
      teacherId: userStore.identityId,
      academicYear: userStore.academicYearId,
      roleId: userStore.roleId,
      gradeId: formData.grade,
    });

    if (response.code === 200) {
      const list = [...(response.data?.adminClasses || []), ...(response.data?.teachclasses || [])];
      classes.value = list;

      // 默认选择第一个班级
      if (list.length > 0) {
        if (!formData.class) {
          const firstClass = list[0];
          formData.class = firstClass.id;
          onClassChange(firstClass.id);
        } else {
          // 如果已有值，但可能不在新列表中 (切换年级时)
          const valid = list.find((c: any) => c.id === formData.class);
          if (!valid) {
            const firstClass = list[0];
            formData.class = firstClass.id;
            onClassChange(firstClass.id);
          } else {
            onClassChange(formData.class);
          }
        }
      } else {
        formData.class = "";
        selectedClassData.value = null;
      }
    }
  } catch (error) {
    console.error("获取班级列表出错:", error);
  }
};

const selectedClassData = ref<any>(null);

const changeGrade = () => {
  formData.class = "";
  getClassList();
};

const onClassChange = (val: any) => {
  const target = classes.value.find(c => c.id === val);
  if (target) {
    // 兼容 scanWeb.ts 中对 classType string 的需求，如果 scanWeb 内部有 value 引用的话
    // 但主要还是 selectedClassData
    const cType = target.classType === 2 ? "1" : "0";
    // 确保 selectedClassData 包含完整字段，如果有缺失则补全
    selectedClassData.value = {
      ...target,
      classType: cType, // 覆盖为字符串格式如果需要，或者 scanWeb 处理了 number
      academicYear: target.academicYear || userStore.academicYearId,
    };
  } else {
    selectedClassData.value = null;
  }
};

const getSubjectData = async () => {
  const res = await getDicts("sys_subject");
  if ((res as any).code === 200) subjectData.value = res.data;
};

const handleOtherSubject = () => (isSubjectDisabled.value = false);
const handleOtherClass = () => {
  isGradeDisabled.value = false;
  isClassDisabled.value = false;
};

let ragRefInstance = ref();
const loadingFun = () => {
  ragRefInstance.value = ElLoading.service({
    lock: true,
    text: "正在扫描中，请不要关闭页面...",
    background: "rgba(0, 0, 0, 0.7)",
    body: true,
  });
};

const closeLoading = () => {
  if (ragRefInstance.value) ragRefInstance.value.close();
};

watch(isClose, newVal => {
  if (newVal) {
    closeLoading();
    ElMessage.success(msg.value || "扫描完成");
    scanningProgress.isScanning = false;
    if (recordId.value) {
      loadScanResults(recordId.value);
    }
  }
});

const loadScanResults = (id: any) => {
  scanningProgress.isScanning = false;
  scanningProgress.statusText = "扫描完成，正在获取结果...";
  scanningProgress.progress = 100;
  if (examProcessTemplateInstId.value) {
    getCompleteScan(examProcessTemplateInstId.value);
  }

  // 1. 处理重复学号
  examWsScanRepeat(id)
    .catch(err => {
      console.error("处理重复学号失败", err);
    })
    .finally(() => {
      // 2. 获取统计数量 只要存在id就去调用
      getExamScanStatistics({ scanRecordId: id }).then(statRes => {
        if (statRes.code === 200 && statRes.data) {
          const data = statRes.data;
          shouldNum.value = data.shouldNum || 0; // 实考
          actualNum.value = data.actualNum || 0;
          lackNum.value = data.missingNum || 0;
          abnormalNum.value = data.errorNum || 0;
          scannedNum.value = data.actualNum || 0; // 已扫描
          identified.value = data.actualNum || 0;
          duplicateNum.value = data.duplicateNum || 0;
          otherAbnormalNum.value = data.otherAbnormalNum || 0;
          repeatScanNum.value = data.repeatScanNum || 0;
        }
      });

      // 3. 获取所有类型的列表
      const requestTypes = [1, 2, 3, 4, 5, 6];
      const promises = requestTypes.map(type => {
        return getExamScanList({
          id: id,
          examMainId: examInfoId.value,
          resultType: type,
        }).then(listRes => ({ type, listRes }));
      });

      Promise.allSettled(promises)
        .then(results => {
          results.forEach(result => {
            if (result.status === "fulfilled") {
              const { type, listRes } = result.value;
              const list = listRes.rows || listRes.row || [];
              switch (type) {
                case 1:
                  allTableData.shouldList = list;
                  break;
                case 2:
                  allTableData.actualList = list;
                  break;
                case 3:
                  allTableData.lackList = list;
                  break;
                case 4:
                  allTableData.abnormalList = list;
                  break;
                case 5:
                  allTableData.otherAbnormalList = list;
                  break;
                case 6:
                  allTableData.repeatList = list;
                  break;
              }
            } else {
              console.error("Scanning list fetch failed for one item", result.reason);
            }
          });

          // 更新汇总数据
          abnormalNum.value = duplicateNum.value + otherAbnormalNum.value;
          // 如果统计接口返回的已扫描数量为0，但实际上有数据，则重新计算
          if (scannedNum.value === 0) {
            scannedNum.value = identified.value + abnormalNum.value;
          }
          scanningProgress.statusText = "扫描结果已获取";
        })
        .catch(err => {
          console.error("获取结果列表部分失败", err);
        });
    });
};

// watch(recordId, newVal => {
//   if (newVal && !scanningState.isScanning) {
//     loadScanResults(newVal);
//   }
// });

onUnmounted(() => {
  if (progressInterval) clearInterval(progressInterval);
  cleanupWebSocket();
  recordId.value = "";
});

// 初始化
openClient();

getSubjectData();
</script>

<style scoped lang="scss">
.connection-status {
  margin-bottom: 20px;
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
    font-size: 14px;
    color: #666666;

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
    height: 105px;
    background: #ffffff;
    border-radius: 12px;
    display: flex;
    align-items: center;
    padding: 0 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border: 1px solid #f0f0f0;

    .num {
      font-size: 36px;
      font-weight: 700;
      color: #333;
    }

    .fh {
      font-size: 18px;
      color: #999;
      margin-left: 8px;
    }

    .scan {
      margin-top: 8px;
      height: 24px;
      display: inline-flex;
      align-items: center;
      padding: 0 12px;
      border-radius: 12px;
      font-size: 12px;
    }

    img {
      width: 120px;
      margin-left: auto;
    }
  }
}

.scanning-progress {
  margin-bottom: 20px;
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

.content-right-table {
  width: 100%;
  min-height: 500px;
  background: #ffffff;
  box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}

:deep(.scan-setting-dialog) {
  border-radius: 8px;

  .el-dialog__header {
    border-bottom: 1px solid #f0f0f0;
  }

  .el-dialog__body {
    padding: 24px 40px;
  }
}

.select-trigger-btn {
  width: 120px;
  border-color: #3c7eff;
  color: #3c7eff;
}

.dialog-action-area {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  gap: 20px;

  .el-button {
    width: 120px;
  }

  .footer-confirm-btn {
    background-color: #0052d9;
    border-color: #0052d9;
  }
}
</style>
