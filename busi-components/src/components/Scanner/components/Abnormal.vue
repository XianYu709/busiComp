<template>
  <div class="top">
    <div class="flex justify-between">
      <div class="flex">
        <img class="w-24px h-24px" src="../images/title.png" alt="" />
        <!-- 学号异常 -->
        <span class="ml-10px fw-500 color-#333 text-16px mt-4px">{{ abnormalLabel }}</span>
      </div>
      <div class="flex">
        <div @click="reIdentifyAll" class="flex cursor-pointer">
          <img class="w-20px h-20px" src="../images/cxsb.png" alt="" />
          <span class="color-#666 ml-5px text-14px mt-3px fw-400">全部重新识别</span>
        </div>
        <div class="flex cursor-pointer ml-10px" @click="handleRefresh">
          <img class="w-20px h-20px" src="../images/sx.png" alt="" />
          <span class="color-#666 ml-5px text-14px mt-3px fw-400">刷新</span>
        </div>
        <div class="flex cursor-pointer ml-10px" @click="handleExport">
          <img class="w-20px h-20px" src="../images/dc.png" alt="" />
          <span class="color-#666 ml-5px text-14px mt-3px fw-400">导出</span>
        </div>
      </div>
    </div>
    <div class="mt-20px flex">
      <el-input
        v-model="searchName"
        placeholder="请输入姓名"
        class="w-260px h-36px mb-20px bg-#f5f6f7 border-none"
        style="width: 260px"
        @keyup.enter="handleSearch">
        <template #append>
          <el-button :icon="Search" @click="handleSearch" />
        </template>
      </el-input>
      <!-- <div class="ml-10px">
        <el-radio
          :model-value="showStudentImage"
          :label="true"
          size="large"
          @click="handleRadioClick">
          考生图像
        </el-radio>
      </div> -->
    </div>
  </div>

  <el-table
    border
    ref="multipleTableRef"
    :data="tableData"
    :row-key="row => row.errorsId || row.id"
    style="width: 96%"
    class="ml-25px mr-25px"
    :header-cell-style="{ background: '#fafafa', color: '#606266', fontWeight: '500' }">
    <el-table-column type="selection" align="center" min-width="55" />

    <el-table-column property="studentName" label="姓名" min-width="100" align="center" />
    <el-table-column
      property="studentCode"
      :label="computedLabel()"
      min-width="100"
      align="center"
      sortable>
      <template #default="scope">
        <span>{{ String(scope.row.studentCode).replace(/unrec404/g, '?') }}</span>
      </template>
    </el-table-column>
    <el-table-column property="schoolName" label="学校" min-width="100" align="center" />
    <el-table-column
      prop="className"
      label="班级"
      min-width="100"
      align="center"
      :filters="classFilters"
      :filter-method="filterTag"
      filter-placement="bottom-end">
      <template #default="scope">
        <el-tag>{{ scope.row.className || "其他班" }}</el-tag>
      </template>
    </el-table-column>

    <el-table-column property="errorInfo" label="状态" align="center" />

    <!-- <el-table-column
      property="createTime"
      label="解析时间"
      min-width="180"
      align="center"
      show-overflow-tooltip
      sortable /> -->

    <el-table-column fixed="right" label="操作" min-width="150" align="center">
      <template #default="scope">
        <el-space :size="2" spacer="|">
          <el-button link type="primary" size="small" @click="viewCard(scope)">查看答卷</el-button>
          <el-button link type="primary" size="small" @click="handleDelete(scope.row)">
            删除
          </el-button>
        </el-space>
      </template>
    </el-table-column>
  </el-table>

  <div class="pagination" style="padding: 25px">
    <el-pagination
      :page-sizes="[10, 20, 30, 40]"
      :background="true"
      layout="total, ->, prev, pager, next, sizes"
      :total="props.total"
      v-model:current-page="state.page"
      v-model:page-size="state.limit"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import { ElTable, ElMessage, ElLoading } from "element-plus";
import { Search } from "@element-plus/icons-vue";
import { useRouter,useRoute } from "vue-router";
import { exportToExcel } from "../utils/exportExcel";
import {
  batchSendImages,
  examwSendImages,
  deleteHomeworkScanError,
  deleteExamScanError,
} from "../api/scan";

const router = useRouter();
const route = useRoute();
const showStudentImage = ref(false); // 可以是 true/false 或具体的值

// 模拟数据
const mockData = [];

const handleRadioClick = (event: Event) => {
  event.preventDefault();
  showStudentImage.value = !showStudentImage.value;
};

// --- 修改点 1: 接收 listData ---
const props = defineProps({
  message: {
    type: String,
  },
  examInfoId: {
    type: String,
  },
  subjectId: {
    type: [String, Number],
  },
  recordId: {
    type: String,
  },
  // 接收父组件传来的列表
  listData: {
    type: Array,
    default: () => [],
  },
  abnormalLabel: {
    type: String,
    default: "",
  },
  total: {
    type: Number,
    default: 0,
  },
  // 复扫需要的参数
  period: {
    type: String,
    default: "",
  },
  academicYear: {
    type: String,
    default: "",
  },
  subject: {
    type: [String, Number],
    default: "",
  },
  grade: {
    type: [String, Number],
    default: "",
  },
  classId: {
    type: [String, Number],
    default: "",
  },
  /** 与列表接口 resultType 一致：4 学号异常，5 其他异常 */
  resultType: {
    type: Number,
    default: 4,
  },
});

const emit = defineEmits<{
  (e: "page-change", page: number, limit: number): void;
  (e: "refresh"): void;
  (e: "search", studentName: string): void;
}>();

const handleRefresh = () => {
  emit("refresh");
};

const message = ref(props.message);
const str = ref("");
const computedLabel = () => {
  if (message.value == "exam") {
    str.value = "考号";
  } else if (message.value == "homework") {
    str.value = "学号";
  }
  return `${str.value}`;
};

interface User {
  studentName: string;
  studentCode: string;
  className: string;
  errorInfo: string;
  createTime: string;
}

// --- 修改点 2: 移除模拟数据和 API 调用 ---
// 直接使用 computed 映射 props.listData
// const tableData = computed(() => props.listData);
const tableData = computed<User[]>(() => {
  if (props.listData && props.listData.length > 0) {
    return props.listData as User[];
  } else {
    // 开发环境下使用模拟数据
    return [] as User[];
  }
});

// 计算班级筛选器
const classFilters = computed(() => {
  // 获取所有不重复的班级，并按数字排序
  const uniqueClasses = Array.from(
    new Set(tableData.value.map(item => item.className || "其他班")),
  ).sort((a, b) => {
    if (a === "其他班") return 1;
    if (b === "其他班") return -1;
    // 尝试提取数字进行排序
    const numA = parseInt(a.match(/\d+/)?.[0] || "0");
    const numB = parseInt(b.match(/\d+/)?.[0] || "0");
    return numA - numB;
  });

  // 转换为 Element Plus 筛选器格式
  return uniqueClasses.map(cls => ({
    text: cls,
    value: cls,
  }));
});

const state = reactive({
  page: 1,
  limit: 10,
});

const searchName = ref("");
const handleSearch = () => {
  state.page = 1;
  emit("search", searchName.value);
};

const multipleTableRef = ref<InstanceType<typeof ElTable>>();

const reIdentifyAll = async () => {
  const selection = multipleTableRef.value?.getSelectionRows() || [];
  if (selection.length === 0) {
    ElMessage.warning("请先勾选需要重新识别的数据");
    return;
  }

  const sendApi = props.message === "exam" ? examwSendImages : batchSendImages;
  let batch: number = 1;
  let loadingInstance: any = null;
  try {
    // 显示 loading
    loadingInstance = ElLoading.service({
      body: true,
      text: "正在重新识别中，请不要关闭此页面！",
      lock: true,
    });

    // 记录已识别的 errorsId
    const identifiedErrorsIds: string[] = [];

    for (const item of selection) {
      const formData = new FormData();
      // 复扫标识
      formData.append("scanActionType", "2");
      // 修复后的实际学号（这里会使用更新后的 studentCode）
      formData.append("realStudentCode", item.studentCode || "");
      // 传递当前 item 的基本信息
      if (item.id) formData.append("id", item.id);
      if (item.studentName) formData.append("studentName", item.studentName);
      if (item.className) formData.append("className", item.className);
      if (item.classId) formData.append("classId", item.classId);
      if (item.classId) formData.append("classType", "0");
      if (item.schoolName) formData.append("schoolName", item.schoolName);
      if (item.errorsId) {
        formData.append("errorsId", item.errorsId);
        identifiedErrorsIds.push(item.errorsId);
      }
      if (item.ossBusinessId) formData.append("ossBusinessId", item.ossBusinessId);
      if (props.recordId) formData.append("scanRecordId", props.recordId);
      if (props.examInfoId) formData.append("examInfoId", props.examInfoId);
      if (props.subjectId) formData.append("subject", String(props.subjectId));
      // 添加复扫需要的参数
      if (item?.periodId) formData.append("period", item.periodId);
      if (props.academicYear) formData.append("academicYear", props.academicYear);
      if (props.subject) formData.append("academicSubject", String(props.subject));
      if (props.grade) formData.append("grade", String(props.grade));

      // 如果是考试重新识别
      if (props.message === "exam") {
        formData.append("scanType", route.query.scanType)
        formData.append("period", route.query.periodId);
      }

      batch++;
      formData.append("batch", String(batch));
      formData.append("realBatchId", String(getRandomPositiveIntegerInJavaRange()));
      await sendApi(formData);
    }

    // 延迟 两秒之后再完后执行刷新
    await new Promise(resolve => setTimeout(resolve, 2000));
    ElMessage.success("重新识别完成");

    // 重新识别完成后，从 localStorage 中移除已识别的记录
    const assignInfoListStr = localStorage.getItem("scannerAssignInfoList");
    if (assignInfoListStr && identifiedErrorsIds.length > 0) {
      try {
        const assignInfoList = JSON.parse(assignInfoListStr);
        // 过滤掉已识别的记录
        const remainingList = assignInfoList.filter(
          (info: any) => !identifiedErrorsIds.includes(info.errorsId),
        );
        if (remainingList.length > 0) {
          localStorage.setItem("scannerAssignInfoList", JSON.stringify(remainingList));
        } else {
          localStorage.removeItem("scannerAssignInfoList");
        }
      } catch (e) {
        console.error("更新分配列表失败:", e);
      }
    }

    emit("refresh");
  } catch (e) {
    console.error("重新识别失败:", e);
    ElMessage.error("重新识别失败，请重试");
  } finally {
    // 隐藏 loading
    if (loadingInstance) {
      loadingInstance.close();
    }
  }
};
/**
 * 生成一个在 Java Integer 正数范围内的随机整数 (0 到 2147483647)
 * @returns {number} 一个介于 0 和 2147483647 之间的随机整数
 */
const getRandomPositiveIntegerInJavaRange = (): number => {
  const JAVA_INT_MAX = 2147483647;

  // Math.random() 生成 [0, 1)，乘以 (JAVA_INT_MAX + 1) 后变成 [0, JAVA_INT_MAX + 1)
  // Math.floor 取整后得到 [0, JAVA_INT_MAX] 范围内的整数
  return Math.floor(Math.random() * (JAVA_INT_MAX + 1));
}

const handleDelete = async (row: any) => {
  const id = row.errorsId;
  if (!id) {
    ElMessage.warning("缺少记录ID，无法删除");
    return;
  }
  const deleteApi = props.message === "exam" ? deleteExamScanError : deleteHomeworkScanError;
  try {
    await deleteApi(id);
    ElMessage.success("删除成功");
    emit("refresh");
  } catch (e) {
    console.error("删除失败:", e);
    ElMessage.error("删除失败，请重试");
  }
};

const handleExport = () => {
  exportToExcel(
    tableData.value,
    [
      { header: "姓名", key: "studentName" },
      { header: str.value || "学号", key: "studentCode" },
      { header: "学校", key: "schoolName" },
      { header: "班级", key: "className" },
      { header: "状态", key: "errorInfo" },
    ],
    props.abnormalLabel || "学号异常列表",
  );
};

const handleCurrentChange = (newPage: number) => {
  state.page = newPage;
  emit("page-change", state.page, state.limit);
};

const handleSizeChange = (newSize: number) => {
  state.limit = newSize;
  state.page = 1;
  emit("page-change", state.page, state.limit);
};

const filterTag = (value: string, row: User) => {
  const rowClass = row.className || "其他班";
  return rowClass === value;
};

// 查看答卷
const viewCard = scope => {
  console.log("查看答卷:", scope);

  const currentRowIndex =
    typeof scope.$index === "number" ? scope.$index : tableData.value.indexOf(scope.row);
  const scanListIndex = (state.page - 1) * state.limit + Math.max(currentRowIndex, 0) + 1;

  // 把当前行数据和必要的上下文信息存到 localStorage
  const viewCardData = {
    ...scope.row,
    // 添加上下文信息
    message: message.value, // exam 或 homework
    recordId: props.recordId,
    examInfoId: props.examInfoId,
    academicYear: props.academicYear,
    gradeId: scope.row.gradeId || props.grade || "",
    classId: scope.row.classId || props.classId || "",
    resultType: props.resultType,
    scanListTotal: props.total,
    scanListIndex,
    scanListPageNum: state.page,
    scanListPageSize: state.limit,
    searchStudentName: searchName.value,
  };

  localStorage.setItem("viewCardData", JSON.stringify(viewCardData));
  router.push({
    path: "/ViewCard",
    query: {
      id: scope.row.studentId || scope.row.studentCode,
    },
  });
};

// 监听数据变化，确保当数据更新时班级筛选器也会更新
watch(
  () => props.listData,
  () => {
    console.log("数据更新，重新生成班级筛选器");
  },
  { deep: true },
);
</script>

<style scoped lang="scss">
.top {
  padding: 25px 25px 0 25px;
}
.border-none {
  :deep(.el-input__wrapper) {
    background: #f5f6f7;
    box-shadow: none !important;
    border: none !important;
  }

  :deep(.el-input-group__append) {
    background: #f5f6f7;
    border: none !important;
    box-shadow: none !important;
  }

  :deep(.el-input__wrapper.is-focus),
  :deep(.el-input__wrapper:hover) {
    box-shadow: none !important;
    border: none !important;
  }
}
</style>
