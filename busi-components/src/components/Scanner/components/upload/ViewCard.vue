<template>
  <div class="h-screen flex flex-col bg-gray-50 overflow-hidden">
    <!-- 顶部导航栏 -->
    <div
      class="h-14 bg-white border-b flex items-center justify-between px-5 shadow-sm shrink-0 z-10">
      <div class="flex items-center gap-4">
        <div
          class="flex items-center text-gray-600 cursor-pointer hover:text-blue-500 transition"
          @click="handleBack">
          <el-icon class="mr-1"><ArrowLeft /></el-icon>
          <span class="text-sm">返回</span>
        </div>
        <div class="h-4 w-px bg-gray-300 mx-2"></div>
        <span class="font-bold text-gray-800">查看答题卡</span>
      </div>

      <div class="flex gap-3">
        <el-button-group>
          <el-button size="default" @click="prevPaper" :disabled="isFirstPaper || isLoadingPaper">
            上一份
          </el-button>
          <el-button size="default" @click="nextPaper" :disabled="isLastPaper || isLoadingPaper">
            下一份
          </el-button>
        </el-button-group>
        <el-button type="primary" size="default" @click="openAssignDrawer" >{{ messageMode == 'exam' ? '分配考生': '分配学生' }}</el-button>
      </div>
    </div>

    <!-- 主体内容区 + 右侧弹出层容器 -->
    <div class="flex-1 flex overflow-hidden bg-white relative">
      <!-- 原主体内容（答题卡+题目区） -->
      <div class="flex-1 flex overflow-hidden">
        <!-- 答题卡图片预览区 -->
        <div class="flex-1 flex flex-col border shadow-sm relative z-0 m-5 overflow-hidden">
          <!-- 图片操作工具栏 -->
          <div class="h-10 border-b flex items-center justify-between px-4 bg-gray-50 select-none">
            <div class="flex items-center gap-4 text-gray-600 mr-4">
              <span class="text-xs text-gray-500 mt-1">考号：{{ studentInfo.studentCode }}</span>
              <span
                class="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                异常类型：{{ studentInfo.errorInfo }}
              </span>
            </div>

            <div class="flex items-center text-sm gap-3">
              <el-tooltip content="左旋转" placement="bottom">
                <el-icon class="icon-btn" @click="rotateLeft"><RefreshLeft /></el-icon>
              </el-tooltip>
              <el-tooltip content="右旋转" placement="bottom">
                <el-icon class="icon-btn" @click="rotateRight"><RefreshRight /></el-icon>
              </el-tooltip>
              <div class="h-4 w-px bg-gray-300"></div>
              <el-tooltip content="放大" placement="bottom">
                <el-icon class="icon-btn" @click="zoomIn"><ZoomIn /></el-icon>
              </el-tooltip>
              <el-tooltip content="缩小" placement="bottom">
                <el-icon class="icon-btn" @click="zoomOut"><ZoomOut /></el-icon>
              </el-tooltip>
              <el-tooltip content="还原 1:1" placement="bottom">
                <el-icon class="icon-btn" @click="resetZoom"><FullScreen /></el-icon>
              </el-tooltip>
              <span class="text-xs text-gray-500">{{ Math.round(zoomScale * 100) }}%</span>
            </div>
          </div>
          <div class="flex-1" style="border: 1px solid #ccc; border-radius: 4px">
            <div
              class="h-94% flex-1 bg-gray-100 overflow-hidden flex items-center justify-center relative m-5"
              style="border: 1px solid #ccc; border-radius: 4px"
              @wheel="handleWheelZoom"
              @mousedown="startDrag"
              @mousemove="handleDragMove"
              @mouseup="stopDrag"
              @mouseleave="stopDrag">
              <!-- 有图片时的显示（并排展示所有图片） -->
              <div
                v-if="ossImages.length > 0 && !isImageLoading"
                class="transition-transform duration-200 ease-out flex gap-4 items-start"
                :style="{
                  transform: `translate(${dragX}px, ${dragY}px) scale(${zoomScale}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  cursor: isDragging ? 'grabbing' : 'grab',
                }"
                ref="imageContainer">
                <img
                  v-for="(url, index) in ossImages"
                  :key="index"
                  :src="url"
                  class="max-h-[80vh] max-w-full block bg-white shadow-lg"
                  :alt="`答题卡第${index + 1}面`"
                  draggable="false" />
              </div>

              <!-- 无图片提示 -->
              <div
                v-else-if="ossImages.length === 0 && !isImageLoading"
                class="flex flex-col items-center justify-center text-gray-400 p-8">
                <el-icon size="48" class="mb-3 text-gray-300"><Picture /></el-icon>
                <span class="text-base">无图片</span>
              </div>

              <!-- 加载状态 -->
              <div v-else-if="isImageLoading" class="flex flex-col items-center justify-center p-8">
                <el-icon size="48" class="text-blue-500 animate-spin mb-4">
                  <Loading />
                </el-icon>
                <span class="text-gray-600">图片加载中...</span>
              </div>

              <!-- 操作提示（有图片时显示） -->
              <div
                v-if="ossImages.length > 0 && !isDragging && !isImageLoading"
                class="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded">
                滚动鼠标滚轮可缩放图片
              </div>
            </div>
          </div>
          <!-- 图片显示区（支持拖拽） -->
        </div>

        <!-- 题目选项区 -->
        <!-- <div
          class="w-[320px] bg-white flex flex-col shrink-0 pb-5 shadow-[-4px_0_10px_rgba(0,0,0,0.02)] z-10 overflow-auto">
          <div class="flex border-b bg-gray-50 mt-5">
            <div
              class="flex-1 text-center py-2.5 text-sm cursor-pointer relative"
              :class="activeTab === 'objective' ? 'text-blue-600 font-bold' : 'text-gray-600'"
              @click="activeTab = 'objective'">
              客观题
              <div
                v-if="activeTab === 'objective'"
                class="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600"></div>
            </div>
            <div
              class="flex-1 text-center py-2.5 text-sm cursor-pointer relative"
              :class="activeTab === 'subjective' ? 'text-blue-600 font-bold' : 'text-gray-600'"
              @click="activeTab = 'subjective'">
              主观题
              <div
                v-if="activeTab === 'subjective'"
                class="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600"></div>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto custom-scrollbar" style="border: 1px solid #ccc">
            <div
              v-if="activeTab === 'objective'"
              class="m-2 border-gray-300 rounded overflow-hidden">
              <el-table
                :data="objectiveQuestions"
                :header-cell-style="{
                  background: '#F9FAFE',
                  color: '#333',
                  borderRight: '1px solid #ddd',
                  borderBottom: '1px solid #ddd',
                }"
                :cell-style="{ borderRight: '1px solid #ddd', borderBottom: '1px solid #ddd' }"
                :row-class-name="tableRowClassName"
                style="width: 100%"
                :show-header="true"
                :default-sort="{ prop: 'questionNo', order: 'ascending' }">
                <el-table-column
                  prop="questionNo"
                  label="题号"
                  width="80"
                  align="center"
                  header-align="center"
                  :resizable="false">
                  <template #default="{ row }">
                    <span class="text-sm font-mono text-gray-800">{{ row.questionNo }}</span>
                  </template>
                </el-table-column>

                <el-table-column
                  prop="selectedOption"
                  label="选项"
                  header-align="left"
                  :resizable="false">
                  <template #default="{ row }">
                    <div class="flex items-center gap-1 pl-2">
                      <div
                        v-for="opt in ['A', 'B', 'C', 'D']"
                        :key="opt"
                        class="option-box w-7 h-7 flex items-center justify-center text-sm cursor-pointer border border-gray-300 rounded-sm transition-all duration-200 hover:bg-gray-50"
                        :class="row.selectedOption === opt ? 'option-selected' : ''"
                        @click="selectOption(row, opt)">
                        {{ opt }}
                      </div>
                    </div>
                  </template>
                </el-table-column>
              </el-table>

              <div
                v-if="objectiveQuestions.length === 0"
                class="h-40 flex flex-col items-center justify-center text-gray-400 border-t border-gray-300">
                <el-empty description="暂无客观题数据" :image-size="60" />
              </div>
            </div>

            <div
              v-else
              class="m-2 border border-gray-300 rounded overflow-hidden"
              style="border: 1px solid #ccc">
              <div class="flex flex-col">
                <div
                  v-for="item in subjectiveQuestions"
                  :key="item.questionNo"
                  class="border-b border-gray-200 p-3">
                  <div class="flex items-center justify-between mb-3">
                    <span class="font-medium text-gray-700">{{ item.questionNo }}</span>
                    <div class="flex items-center gap-3">
                      <span
                        class="text-xs text-blue-600 cursor-pointer hover:text-blue-800"
                        @click="handleUploadImage(item)">
                        上传图片
                      </span>
                      <div class="h-3 w-px bg-gray-300"></div>
                      <span
                        class="text-xs text-blue-600 cursor-pointer hover:text-blue-800"
                        @click="handleDeleteImage(item)">
                        删除
                      </span>
                    </div>
                  </div>

                  <div
                    class="border border-gray-300 rounded mb-2 bg-gray-50"
                    style="border: 1px solid #ccc; border-radius: 3px"
                    :style="{ height: item.imageUrl ? 'auto' : '40px' }"
                    @click="!item.imageUrl && handleUploadImage(item)"
                    :class="{ 'cursor-pointer': !item.imageUrl }">
                    <img
                      v-if="item.imageUrl"
                      :src="item.imageUrl"
                      class="w-full h-auto max-h-48 object-contain p-1"
                      alt="主观题图片"
                      @error="handleImageError(item)" />
                    <div v-else class="w-full h-10 flex items-center justify-center">
                    </div>
                  </div>
                </div>

                <div
                  v-if="subjectiveQuestions.length === 0"
                  class="h-40 flex flex-col items-center justify-center text-gray-400">
                  <el-empty description="暂无主观题数据" :image-size="60" />
                </div>
              </div>
            </div>
          </div>
        </div> -->
      </div>

      <!-- 右侧弹出层（分配考生） -->
      <el-drawer
        v-model="assignDrawerVisible"
        direction="rtl"
        size="32%"
        :title="messageMode === 'exam' ? '为当前答题卡分配考生' : '为当前作业分配学生'"
        :with-header="true"
        :close-on-click-modal="false">
        <!-- 搜索栏 -->
        <div class="mb-3 flex items-center gap-2">
          <span>{{ messageMode == "exam" ? "考号：" : "学号：" }}</span>
          <el-input v-model="searchKey" :placeholder="messageMode == 'exam' ? '请输入考号' : '请输入学号'" clearable style="width: 200px"  @keydown.enter="fetchStudents">
            <template #append>
              <el-button :icon="Search" @click="fetchStudents" />
            </template>
          </el-input>
        </div>

        <!-- 考生列表表格 -->
        <el-table
          :data="studentList"
          v-loading="studentLoading"
          border
          style="width: 100%"
          :header-cell-style="{ background: '#f5f7fa', fontSize: '14px' }"
          :cell-style="{ fontSize: '13px' }">
          <el-table-column prop="studentCode" :label="messageMode == 'exam' ? '考号' : '学号'" align="center" width="120" />
          <el-table-column prop="name" label="姓名" align="center" />
          <el-table-column prop="deptName" label="学校" align="center"  />
          <el-table-column label="操作" align="center" width="180">
            <template #default="{ row }">
              <div class="flex items-center justify-center">
                <span
                  class="text-blue-500 text-xs cursor-pointer hover:text-blue-600 transition"
                  @click="handleAssign(row, '实考')">
               {{ messageMode == 'exam' ? '提交为实考': '设为实交' }}
                </span>
                <!-- <div class="h-4 w-px bg-gray-300 mx-2"></div>
                <span
                  class="text-blue-500 text-xs cursor-pointer hover:text-blue-600 transition"
                  @click="handleAssign(row, '缺考')">
                  提交为缺考
                </span> -->
              </div>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="mt-3 flex justify-between items-center">
          <span class="text-sm text-gray-500">共{{ studentTotal }}条记录</span>
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[10, 20, 50]"
            :page-size="pageSize"
            layout="prev, pager, next, jumper"
            :total="studentTotal"
            :pager-count="5"
            small />
        </div>
      </el-drawer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElDrawer } from "element-plus";
import { getStudentList, getOssImage, getExamScanList, getHomeworkPage } from "../../api/scan";
import {
  ArrowLeft,
  RefreshLeft,
  RefreshRight,
  ZoomIn,
  ZoomOut,
  FullScreen,
  Loading,
  Search,
  Picture,
} from "@element-plus/icons-vue";

const router = useRouter();

// 1. 考生数据（匹配图片中的题目选项）
const paperList = reactive<any[]>([]);

// 保存查询参数，用于上一份/下一份
const queryContext = ref<any>(null);
const messageMode = ref<"exam" | "homework">("exam"); // 用于判断是考试还是作业
const currentRecordIndex = ref(0); // 当前记录在列表中的索引
const totalRecords = ref(0); // 总记录数
const isLoadingPaper = ref(false); // 是否正在加载答卷

// 分配考生弹出层
const studentList = ref<any[]>([]);
const studentTotal = ref(0);
const studentLoading = ref(false);
const assignDrawerVisible = ref(false);
const searchKey = ref("");
const currentPage = ref(1);
const pageSize = ref(10);

// 查询考生列表
const fetchStudents = async () => {
  const examInfoId = queryContext.value?.queryParams?.examInfoId;
  if ((examInfoId === undefined || examInfoId === null || examInfoId === "") && messageMode.value == "exam") {
    ElMessage.warning("缺少考试信息，无法查询考生列表");
    studentList.value = [];
    studentTotal.value = 0;
    return;
  }

  studentLoading.value = true;
  try {
    const params = {
      examInfoId,
      pageSize: pageSize.value,
      pageNum: currentPage.value,
      studentCode: searchKey.value.trim(),
      academicYear: "",
      gradeId: "",
      classId: "",
      isExam: ""
    };
    if(messageMode.value == "homework") {
      params.isExam = "1"
      params.academicYear = queryContext.value?.queryParams.academicYear
      params.gradeId = queryContext.value?.queryParams.gradeId
      params.classId = queryContext.value?.queryParams.classId
    }
    const res: any = await getStudentList(params);
    if (res.code === 200) {
      studentList.value = res.rows;
      studentTotal.value = res.total || 0;
    }
  } finally {
    studentLoading.value = false;
  }
};

// 当前选中的答题卡索引
const currentPaperIndex = ref(0);
// 当前考生信息
const studentInfo = computed(() => {
  const current = paperList[currentPaperIndex.value];
  return {
    ...current,
  };
});

const currentPaperNo = computed(() => queryContext.value?.pagination?.pageNum ?? 1);

// 是否是第一份/最后一份答题卡（控制按钮禁用状态）
const isFirstPaper = computed(() => {
  if (!queryContext.value) return true;
  return currentPaperNo.value <= 1;
});
const isLastPaper = computed(() => {
  if (!queryContext.value) return true;
  const total = Number(totalRecords.value || 0);
  return total <= 0 || currentPaperNo.value >= total;
});

// 2. 图片控制

const zoomScale = ref(1);
const rotation = ref(0);
const dragX = ref(0);
const dragY = ref(0);
const isDragging = ref(false);
const startX = ref(0);
const startY = ref(0);
const isImageLoading = ref(false);
const originalErrorsId = ref(""); // 原始异常记录的 errorsId，用于分配学生时关联

// 图片缩放
const zoomIn = () => {
  if (zoomScale.value < 3) {
    zoomScale.value += 0.1;
  } else {
    // ElMessage.warning("已达到最大缩放比例");
  }
};
const zoomOut = () => {
  if (zoomScale.value > 0.4) {
    zoomScale.value -= 0.1;
  } else {
    // ElMessage.warning("已达到最小缩放比例");
  }
};
// 还原缩放和旋转
const resetZoom = () => {
  zoomScale.value = 1;
  rotation.value = 0;
  dragX.value = 0;
  dragY.value = 0;
};
// 旋转图片
const rotateLeft = () => (rotation.value -= 90);
const rotateRight = () => (rotation.value += 90);

// 鼠标滚轮缩放
const handleWheelZoom = (e: WheelEvent) => {
  e.preventDefault();
  if (e.deltaY < 0) {
    zoomIn();
  } else {
    zoomOut();
  }
};

// 拖拽图片
const startDrag = (e: MouseEvent) => {
  e.preventDefault();
  isDragging.value = true;
  startX.value = e.clientX - dragX.value;
  startY.value = e.clientY - dragY.value;
};
const handleDragMove = (e: MouseEvent) => {
  if (!isDragging.value) return;
  dragX.value = e.clientX - startX.value;
  dragY.value = e.clientY - startY.value;
};
const stopDrag = () => {
  isDragging.value = false;
};

// 3. 题目数据
// const activeTab = ref<"objective" | "subjective">("objective");
// const objectiveQuestions = computed(() => paperList[currentPaperIndex.value].objectiveQuestions);
// const subjectiveQuestions = computed(() => paperList[currentPaperIndex.value].subjectiveQuestions);

// const selectOption = (item, option) => {
//   item.selectedOption = item.selectedOption === option ? "" : option;
// };

// const tableRowClassName = ({ rowIndex }) => {
//   return rowIndex % 2 === 1 ? "even-row" : "odd-row";
// };

// 4. 路由与操作
const handleBack = () => {
  router.back();
};

// 上一份答题卡
const prevPaper = async () => {
  if (isFirstPaper.value || isLoadingPaper.value) return;

  isLoadingPaper.value = true;
  try {
    // 上一份就是页码减1
    await loadPaperByIndex(currentPaperNo.value - 1, 0);
  } catch (e) {
    console.error("加载上一份失败:", e);
    ElMessage.error("加载上一份失败");
  } finally {
    isLoadingPaper.value = false;
  }
};

// 下一份答题卡
const nextPaper = async () => {
  if (isLastPaper.value || isLoadingPaper.value) return;

  isLoadingPaper.value = true;
  try {
    // 下一份就是页码加1
    await loadPaperByIndex(currentPaperNo.value + 1, 0);
  } catch (e) {
    console.error("加载下一份失败:", e);
    ElMessage.error("加载下一份失败");
  } finally {
    isLoadingPaper.value = false;
  }
};

// 根据页码和索引加载答卷
const loadPaperByIndex = async (pageNum: number, _indexInPage: number) => {
  const total = Number(totalRecords.value || 0);
  if (pageNum < 1 || (total > 0 && pageNum > total)) return;

  const { queryParams } = queryContext.value;
  // 使用 messageMode 判断调用哪个 API，不从 queryParams 中获取
  const fetchApi = messageMode.value === "exam" ? getExamScanList : getHomeworkPage;

  // 每次只查询1条数据
  const params: any = {
    resultType: queryParams.resultType,
    id: queryParams.recordId,
    pageNum,
    pageSize: 1, // 每次只查1条
  };

  if (queryParams.examInfoId) params.examMainId = queryParams.examInfoId;
  if (queryParams.studentName) params.studentName = queryParams.studentName;

  const res: any = await fetchApi(params);
  if (res.code === 200 && res.rows && res.rows.length > 0) {
    const rowData = res.rows[0]; // 只取第一条

    // 更新 paperList
    paperList.length = 0;
    paperList.push({
      ...rowData,
      cardImages: {
        front: rowData.frontImageUrl || "",
        back: rowData.backImageUrl || "",
      },
    });

    // 更新当前索引和分页信息
    currentRecordIndex.value = pageNum - 1;
    queryContext.value.pagination.pageNum = pageNum;
    totalRecords.value = typeof res.total === "number" ? res.total : totalRecords.value;

    // 更新 originalErrorsId
    originalErrorsId.value = rowData.errorsId;

    // 检查本地存储的分配信息，如果有匹配的 errorsId，更新学号
    const assignInfoListStr = localStorage.getItem("scannerAssignInfoList");
    if (assignInfoListStr) {
      try {
        const assignInfoList = JSON.parse(assignInfoListStr);
        const matchedAssign = assignInfoList.find(
          (item: any) => item.errorsId === rowData.errorsId,
        );
        if (matchedAssign && matchedAssign.newStudentCode) {
          // 更新 paperList 中的学号
          paperList[0].studentCode = matchedAssign.newStudentCode;
        }
      } catch (e) {
        console.error("检查分配信息失败:", e);
      }
    }

    // 加载图片
    isImageLoading.value = true;
    try {
      const imgRes: any = await getOssImage(rowData.ossBusinessId);
      if (imgRes?.data?.length > 0) {
        ossImages.value = imgRes.data.map((item: any) => item.url);
      } else {
        ossImages.value = [];
      }
    } catch (e) {
      console.error("加载图片失败:", e);
      ossImages.value = [];
    } finally {
      isImageLoading.value = false;
    }

    resetZoom();
    ElMessage.success(`已切换到【${rowData.studentName || "未知"}】的答题卡`);
  } else {
    ElMessage.error("加载答卷数据失败");
  }
};

// 分配考生弹出层操作
const openAssignDrawer = () => {
  assignDrawerVisible.value = true;
  fetchStudents();
};
const handleAssign = (row: any, status: any) => {
  // 获取原始异常记录的 errorsId（从 paperList 中获取）
  const originalRecord = paperList[currentPaperIndex.value];
  const errorsId = originalRecord?.errorsId;

  // 保存分配信息：使用数组存储，支持多个分配操作
  const newAssignInfo = {
    errorsId, // 原始异常记录的唯一标识
    newStudentCode: row.studentCode, // 新分配的考号
    newStudentName: row.name, // 新分配的学生姓名
    status,
  };

  // 从 localStorage 读取现有的分配列表
  const existingListStr = localStorage.getItem("scannerAssignInfoList");
  let assignInfoList = [];
  if (existingListStr) {
    try {
      assignInfoList = JSON.parse(existingListStr);
    } catch (e) {
      console.error("解析分配列表失败:", e);
      assignInfoList = [];
    }
  }

  // 检查是否已存在相同 errorsId 的记录，如果存在则更新，否则追加
  const existingIndex = assignInfoList.findIndex((item: any) => item.errorsId === errorsId);
  if (existingIndex !== -1) {
    assignInfoList[existingIndex] = newAssignInfo;
  } else {
    assignInfoList.push(newAssignInfo);
  }

  localStorage.setItem("scannerAssignInfoList", JSON.stringify(assignInfoList));
  ElMessage.success(`已将【${row.name}】分配为${status}`);
  // 返回 ScannerPage
  router.back();
};
// 分页操作
const handleSizeChange = val => {
  pageSize.value = val;
  fetchStudents();
};
const handleCurrentChange = val => {
  currentPage.value = val;
  fetchStudents();
};
const ossImages = ref<string[]>([]);
// 监听图片加载状态
onMounted(async () => {
  // 从 localStorage 读取查看答卷的数据
  const viewCardDataStr = localStorage.getItem("viewCardData");
  if (viewCardDataStr) {
    try {
      const rowData = JSON.parse(viewCardDataStr);
      // 保存 message 用于判断是考试还是作业
      messageMode.value = (rowData.message || "exam") as "exam" | "homework";

      // 初始化查询上下文，用于上一份/下一份功能
      const scanListIndex = Number(rowData.scanListIndex || 1);
      queryContext.value = {
        pagination: {
          pageNum: Number.isFinite(scanListIndex) && scanListIndex > 0 ? scanListIndex : 1,
        },
        queryParams: {
          resultType: rowData.resultType ?? 4,
          recordId: rowData.recordId || "",
          examInfoId: rowData.examInfoId || "",
          studentName: rowData.searchStudentName || "",
          academicYear: rowData.academicYear || "",
          gradeId: rowData.gradeId || "",
          classId: rowData.classId || "",
        },
      };

      // 保存原始 errorsId，用于分配学生时关联
      originalErrorsId.value = rowData.errorsId || rowData.id || "";
      currentRecordIndex.value = queryContext.value.pagination.pageNum - 1;
      totalRecords.value =
        typeof rowData.scanListTotal === "number" ? rowData.scanListTotal : 1;

      paperList.push({
        ...rowData,
        cardImages: {
          front: rowData.frontImageUrl || "",
          back: rowData.backImageUrl || "",
        },
      });

      isImageLoading.value = true;
      const res: any = await getOssImage(rowData.ossBusinessId);
      if (res?.data?.length > 0) {
        ossImages.value = res.data.map((item: any) => item.url);
      }
    } catch (e) {
      console.error("解析答卷数据失败:", e);
    } finally {
      localStorage.removeItem("viewCardData");
      isImageLoading.value = false;
    }
  }
});
</script>

<style scoped>
/* 定义图标按钮的通用样式 */
.icon-btn {
  font-size: 18px;
  cursor: pointer;
  transition: color 0.2s;
}
.icon-btn:hover {
  color: #409eff;
}

/* 自定义滚动条样式，让列表更精致 */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background-color: transparent;
}

/* 拖拽状态样式 */
:deep(.el-icon) {
  user-select: none;
}

/* 关键修改2：使用 :deep 穿透 + !important 强制生效选中样式 */
:deep(.option-box) {
  box-sizing: border-box !important; /* 边框计入尺寸 */
}
:deep(.option-selected) {
  border: 1px solid #409eff !important; /* 蓝色边框强制生效 */
  background-color: #e6f7ff !important; /* 浅蓝色背景 */
  color: #1890ff !important; /* 蓝色文字 */
  font-weight: 500 !important;
}

/* 表格边框样式 */
:deep(.el-table) {
  border: 1px solid #ddd;
}
:deep(.el-table th) {
  border-right: 1px solid #ddd !important;
  border-bottom: 1px solid #ddd !important;
}
:deep(.el-table td) {
  border-right: 1px solid #ddd !important;
  border-bottom: 1px solid #ddd !important;
}
:deep(.el-table--border) {
  border: 1px solid #ddd;
}

/* 动画样式 */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
