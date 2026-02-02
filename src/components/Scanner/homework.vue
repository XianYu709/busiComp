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
        <span class="header-c-title">扫描作业</span>
        <div class="header-c-des">
          <span class="span1">作业名称：{{ homeworkName }}</span>
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
                <span>应交（{{ shouldNum }}）</span>
              </template>
            </el-menu-item>

            <el-menu-item index="2">
              <template #title>
                <span>实交（{{ actualNum }}）</span>
              </template>
            </el-menu-item>
            <el-menu-item index="3">
              <template #title>
                <span>缺少作业（{{ lackNum }}）</span>
              </template>
            </el-menu-item>
            <el-sub-menu index="7">
              <template #title>
                <span>异常作业（{{ abnormalNum }}）</span>
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
              <span class="num">{{ scanned }}</span>
              <span class="fh">个</span>
              <p class="scan bg-#E7EFF9"><span class="ysm color-#0E5FC7">已扫描</span></p>
            </div>
            <img src="./images/239(1).png" alt="" />
          </div>

          <div class="content-right-header-c">
            <div>
              <span class="num">{{ identified }}</span>
              <span class="fh">个</span>
              <p class="scan bg-#E9F6F3"><span class="ysm color-#20A28B">已识别</span></p>
            </div>
            <img src="./images/ysb.png" alt="" />
          </div>

          <div class="content-right-header-r">
            <div>
              <span class="num">{{ abnormalNum }}</span>
              <span class="fh">个</span>
              <p class="scan bg-#FDE8E8"><span class="color-#EB1919">异常作业</span></p>
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
            message="homework"
            :record-id="recordId"
            :list-data="currentTableData"
            :subtitle="currentTableSubtitle"
            :should-label="shouldLabel"
            :actual-label="actualLabel"
            :lack-label="lackLabel"
            :other-label="otherLabel"
            :repeated-label="repeatedLabel"
            :abnormal-label="abnormalLabel"></component>
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

        <el-form-item label="选择对应页数" prop="isMultiPage">
          <el-select
            v-model="formData.isMultiPage"
            placeholder="请选择"
            style="width: 100%"
            class="white-input">
            <el-option label="单份作业-单页" :value="false" />
            <el-option label="单份作业-多页" :value="true" />
          </el-select>
        </el-form-item>

        <!-- <el-form-item label="选择栏数" prop="layout">
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
        </el-form-item> -->

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
            :disabled="isClassDisabledgrade"
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
                v-for="item in filteredClasses"
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

<style scoped lang="scss">
// 样式保持不变
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

.dialog-action-area {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;

  .action-btn {
    width: 100px;
  }

  .confirm-btn {
    margin-left: 20px;
  }
}

// 原有样式保持不变
.el-select {
  width: 500px;
}

.dialog-footer {
  text-align: center;
}

.common-header {
  width: 1920px;
  height: 80px;
  background: #ffffff;
  box-shadow: 0px 4px 20px 0px rgba(0, 0, 0, 0.15);
  border-radius: 0px 0px 0px 0px;
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

    .el-menu-item-group__title {
      padding: 0;
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
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
    }

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
        margin-left: 4px;
        margin-left: 12px;
      }

      .scan,
      .yczy-p {
        margin-top: 8px;
        height: 24px;
        display: inline-flex;
        align-items: center;
        padding: 0 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
        margin-left: 20px;

        span {
          line-height: 1;
        }
      }

      .yczy-p {
        background: rgba(235, 25, 25, 0.1);

        .yczy {
          color: #eb1919;
        }
      }
    }

    img {
      width: 178px;
      height: 105px;
    }
  }
}

.content-right-header-r {
  .yczy-p {
    width: 80px;
    height: 24px;
    background: #eb1919;
    border-radius: 25px;
    opacity: 0.1;
    text-align: center;

    .yczy {
      width: 56px;
      height: 17px;
      font-family: Source Han Sans;
      font-weight: 500;
      font-size: 14px;
      color: #eeff00;
      line-height: 17px;
    }
  }
}

.content-right-table {
  width: 100%;
  background: #ffffff;
  box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.05);
  border-radius: 10px 10px 10px 10px;
  margin: 20px 0;
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
      width: 70px;
      height: 24px;
      font-family: DM Sans;
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
    width: 72px;
    height: 26px;
    font-family: Source Han Sans;
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
      width: auto;
      height: 22px;
      font-family: Source Han Sans;
      font-weight: 400;
      font-size: 14px;
      color: #666666;
      line-height: 22px;
    }

    .span2 {
      margin: 0 94px;
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
    background: #0052d9;
    border-radius: 4px;
  }
}

.pagination {
  text-align: right;
}

/* 1. 弹框整体样式 */
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

/* 2. 表单 Label 样式 */
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

/* 3. 白色输入框 (扫描仪、纸张) */
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

/* 4. 灰色展示框 (学科、年级、班级 - 基于 disabled 状态修改) */
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

/* 5. 选择按钮样式 (选择学科、选择班级) */
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
    box-shadow: 0 4px 12px rgba(14, 95, 199, 0.25);
  }

  &.is-disabled {
    border-color: #e4e7ed;
    color: #c0c4cc;
    background-color: #fff;
    box-shadow: none;
  }
}

/* 6. 底部按钮区域 */
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
</style>

<script setup lang="ts">
import { ref, reactive, shallowRef, computed, watch, onUnmounted, nextTick } from "vue";
import { ElLoading, ElMessage } from "element-plus";
import type { FormRules, FormInstance } from "element-plus";
import Actual from "./components/Actual.vue"; // 实交
import Should from "./components/Should.vue"; // 应交
import Lack from "./components/Lack.vue"; // 缺少
import Abnormal from "./components/Abnormal.vue"; // 异常 学号重复
import Other from "./components/Other.vue"; // 异常 其他异常
import Repeated from "./components/Repeated.vue"; // 重复

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
} from "./js/scanWeb";

import {
  getDicts,
  getInfo,
  getHomeworkPage,
  getStatistics,
  classListAuth,
  getscanRecord,
} from "./api/scan";
import { useRoute } from "vue-router";
const route = useRoute();

import { useUserStore } from "@apps/core/store/modules/user";

// 获取用户信息
const userStore = useUserStore();

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
const isClassDisabledgrade = ref(true);

// --- 新增：组件映射和菜单状态 ---
const activeMenuIndex = ref(sessionStorage.getItem("scanner_homework_active_tab") || "1");
const componentMap: Record<string, any> = {
  "1": Should,
  "2": Actual,
  "3": Lack,
  "4": Abnormal,
  "5": Other,
  "6": Repeated,
};
const currentComponent = shallowRef(componentMap[activeMenuIndex.value] || Should);

// --- 新增：统计数据 ---
const duplicateNum = ref(0);
const otherAbnormalNum = ref(0);
const repeatScanNum = ref(0);
const shouldNum = ref(0);
const actualNum = ref(0);
const lackNum = ref(0);
const scanned = ref(0);
const identified = ref(0);
const abnormalNum = ref(0); // 添加这个，注意大小写

// --- 新增：计算属性 ---
const getScanButtonText = computed(() => {
  if (wsConnecting.value) return "连接中...";
  if (scanningProgress.isScanning) return "扫描中...";
  if (!wsConnected.value) return "连接扫描仪";
  return "开始扫描";
});

// 当前表格副标题（显示数量）
const currentTableSubtitle = computed(() => {
  let count = 0;
  let total = 0;

  switch (activeMenuIndex.value) {
    case "1":
      count = allTableData.shouldList.length;
      total = shouldNum.value;
      return `共 ${total} 项，当前显示 ${count} 项`;
    case "2":
      count = allTableData.actualList.length;
      total = actualNum.value;
      return `共 ${total} 项，当前显示 ${count} 项`;
    case "3":
      count = allTableData.lackList.length;
      total = lackNum.value;
      return `共 ${total} 项，当前显示 ${count} 项`;
    case "4":
      count = allTableData.abnormalList.length;
      total = duplicateNum.value;
      return `共 ${total} 项，当前显示 ${count} 项`;
    case "5":
      count = allTableData.otherAbnormalList.length;
      total = otherAbnormalNum.value;
      return `共 ${total} 项，当前显示 ${count} 项`;
    case "6":
      count = allTableData.repeatList.length;
      total = repeatScanNum.value;
      return `共 ${total} 项，当前显示 ${count} 项`;
    default:
      return "";
  }
});

// --- 初始化默认值逻辑 ---
const initDefaultScanSettings = () => {
  if (devices.value && devices.value.length > 0) {
    formData.scanName = (devices.value as string[])[0];

    // 确保设备名称同步并触发连接
    if (formData.scanName) {
      deviceName.value = formData.scanName;
      onDeviceChanged(formData.scanName);
    }
  } else {
    formData.scanName = "";
  }
  formData.paperSize = "A4";
  const adminClasses = userStore.rawData.academicYear[0].services;

  if (adminClasses.length > 0) {
    const defaultInfo = adminClasses[0];

    // 1. 设置学科
    formData.subject = String(defaultInfo.subjectId);

    // 2. 设置年级
    formData.grade = defaultInfo.gradeId;

    // 3. 设置班级
    formData.class = defaultInfo.classId;

    // 4. 如果有年级，获取班级列表并默认选择第一个
    if (formData.grade) {
      getClassList();
    }

    // 5. 锁定状态
    isSubjectDisabled.value = true;
    isClassDisabledgrade.value = true;
    isClassDisabled.value = true;
  } else {
    isSubjectDisabled.value = false;
    isClassDisabledgrade.value = false;
    isClassDisabled.value = false;
  }
};

// --- 点击"其他学科" ---
const handleOtherSubject = () => {
  isSubjectDisabled.value = false;
};

// --- 点击"其他班级" ---
const handleOtherClass = () => {
  isClassDisabledgrade.value = false;
  isClassDisabled.value = false;
  getClassList();
};

// 作业信息
const homeworkName = ref("");
homeworkName.value = (route.query.name as string) || "";

// 点击开始扫描出现dialog
const dialogFormVisible = ref(false);
// 二次确认提示
const innerVisible = ref(false);

const paperSizeSelected = ref(paperSize_value.value);
const gradeSelected = ref("");
const classSelected = ref("");
const changeGrade = (val: string) => {
  gradeSelected.value = val;
  // 清空班级选择，等待获取新班级列表后自动选择第一个
  formData.class = "";
  selectedClassData.value = null;
  getClassList();
};

// 班级选择变化时更新完整班级数据
const onClassChange = (classId: string) => {
  if (filteredClasses.value && classId) {
    const classData = filteredClasses.value.find((item: any) => item.id === classId);
    if (classData) {
      selectedClassData.value = classData;
    }
  }
};

// 纸张大小列表
const paperSizeList = paperSize_list;

// const layoutList = [
//   { label: "单栏", value: 1 },
//   { label: "双栏", value: 2 },
//   { label: "三栏", value: 3 },
// ];

// 子组件标题文案
const shouldLabel = ref("应交");
const actualLabel = ref("实交");
const lackLabel = ref("缺少作业");
const otherLabel = ref("其他异常");
const repeatedLabel = ref("重复扫描");
const abnormalLabel = ref("学号重复");

// 扫描参数
const scanParams = new Array();

// 用户可以编辑的扫描设置
const userConfig = reactive({
  file_save_path: "C:\\",
  file_name_prefix: "Doc",
  file_name_mode: "folder_time_img_order",
  image_format: "jpg",
  image_jpeg_quality: 80,
  image_tiff_compression: "lzw",
  image_tiff_jpeg_quality: 80,
});

interface RuleForm {
  scanName: string;
  paperSize: string;
  grade: string;
  class: string;
  subject: string;
  // layout: number;
  isMultiPage: boolean;
}

const ruleFormRef = ref<FormInstance>();

const formData = reactive<RuleForm>({
  scanName: deviceName.value,
  paperSize: paperSizeSelected.value,
  grade: gradeSelected.value,
  class: classSelected.value,
  subject: (subjectDefault.value as string) || "",
  // layout: 1,
  isMultiPage: false,
});

const adminClasses = userStore.rawData.academicYear[0].services;
const gradeName = adminClasses[0].gradeName;

const subjectName = adminClasses[0].subjectName;

// 校验规则
const rules = reactive<FormRules<RuleForm>>({
  scanName: [{ required: true, message: "选择一个设备", trigger: "change" }],
  paperSize: [{ required: true, message: "选择纸张大小", trigger: "change" }],
  subject: [{ required: true, message: "选择学科", trigger: "change" }],
  grade: [{ required: true, message: "选择年级", trigger: "change" }],
  class: [{ required: true, message: "选择班级", trigger: "change" }],
  // layout: [{ required: true, message: "选择栏数", trigger: "change" }],
  isMultiPage: [{ required: true, message: "选择页数", trigger: "change" }],
});

// 年级数据
const grades = ref([]);

// 返回上一页
const goBack = () => {
  window.history.back();
};

// --- 新增：菜单选择处理函数 ---
const handleMenuSelect = (index: string) => {
  activeMenuIndex.value = index;
  const component = componentMap[index];
  if (component) {
    currentComponent.value = component;
    sessionStorage.setItem("scanner_homework_active_tab", index);
  }

  // 如果需要刷新数据
  if (recordId.value) {
    refreshTableData();
  }
};

// --- 修改：打开客户端函数 ---
const openClient = async () => {
  wsConnecting.value = true;
  wsError.value = false;
  // 初始化WebSocket连接
  await initBWebSocket();
};

// 监听连接状态变化
watch(
  () => [
    wsConnectionState.connected,
    wsConnectionState.error,
    wsConnectionState.connecting,
    devices.value.length,
  ],
  ([connected, error, connecting, deviceCount]) => {
    // 1. 同步连接中的状态
    // 注意：如果是初始手动触发的 openClient，wsConnecting 可能是 true，这里我们优先信任全局状态，
    // 但为了避免闪烁，如果全局是 connecting=true，本地必然是 true。
    if (connecting) {
      wsConnecting.value = true;
      wsError.value = false;
    }

    // 2. 连接成功判断
    if (connected && (deviceCount as number) > 0) {
      wsConnected.value = true;
      wsConnecting.value = false;
      wsError.value = false;

      // 设置默认设备
      if (!formData.scanName && (devices.value as string[]).length > 0) {
        formData.scanName = (devices.value as string[])[0];
      }
    }
    // 3. 错误判断
    else if (error) {
      // 只有当不再尝试连接时才显示错误
      if (!connecting) {
        wsConnected.value = false;
        wsConnecting.value = false;
        wsError.value = true;
        wsErrorMsg.value = wsConnectionState.errorMessage || "连接扫描仪失败";
      }
    }
  },
  { immediate: true },
);

// 组件挂载时自动连接
openClient();

// --- 新增：重连函数 ---
const reconnectWebSocket = async () => {
  if (!wsConnecting.value) {
    await openClient();
  }
};

// 开始扫描
const openDialog = () => {
  // 检查连接状态
  if (!wsConnected.value) {
    ElMessage.warning("请先连接扫描仪");
    reconnectWebSocket();
    return;
  }

  // 初始化默认数据
  initDefaultScanSettings();
  // 显示扫描设置
  dialogFormVisible.value = true;
};

// 扫描设置首次确认
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;

  await formEl.validate((valid, fields) => {
    if (valid) {
      innerVisible.value = true;
      console.log("表单验证通过");
    } else {
      console.log("表单验证失败:", fields);
    }
  });
};

// 切换驱动
const onchangeDevide = (value: any) => {
  deviceName.value = value;
  onDeviceChanged(value);
};

// --- 修改：二次确认扫描设置 ---
const isShowdialog = () => {
  // 关闭对话框
  innerVisible.value = false;
  dialogFormVisible.value = false;

  // 检查设备状态
  if (!deviceOpened.value) {
    ElMessage.warning("设备未就绪，请检查扫描仪连接");
    return;
  }

  // 设置扫描参数
  setGlobalConfig(userConfig);
  setScanParams(scanParams);

  // 开始扫描
  startScanningProcess();
};

// --- 新增：开始扫描流程 ---
const startScanningProcess = () => {
  // 重置进度状态
  scanningProgress.isScanning = true;
  scanningProgress.scannedCount = 0;
  scanningProgress.uploadedCount = 0;
  scanningProgress.totalCount = 0;
  scanningProgress.progress = 0;
  scanningProgress.statusText = "正在连接扫描仪...";

  // 确保之前的加载状态已清除
  closeLoading();

  // 显示加载动画
  loadingFun();

  // 开始扫描，传递完整的班级数据
  // 查找当前年级的学段
  const currentGrade = adminClasses.find((item: any) => item.gradeId == formData.grade);
  const periodId = currentGrade?.periodId || "";

  // 开始扫描，传递完整的班级数据
  startScan(
    formData.grade,
    formData.class,
    classIdSelected.value,
    formData.subject,
    homeworkName.value,
    teacherId.value,
    selectedClassData.value, // 传递完整的班级对象数据
    "homework",
    "",
    String(periodId),
    "",
    "",
    1,
    formData.paperSize,
    formData.isMultiPage,
  );

  // 启动进度监控
  startProgressMonitoring();
};

// --- 新增：进度监控 ---
let progressInterval: any = null;
const startProgressMonitoring = () => {
  if (progressInterval) {
    clearInterval(progressInterval);
  }

  progressInterval = setInterval(() => {
    // 同步扫描状态
    scanningProgress.scannedCount = scanningState.scannedImages || 0;
    scanningProgress.uploadedCount = scanningState.uploadedImages || 0;

    // 计算进度百分比
    if (scanningProgress.totalCount > 0) {
      scanningProgress.progress = Math.min(
        100,
        Math.floor((scanningProgress.scannedCount / scanningProgress.totalCount) * 100),
      );
    }

    // 更新进度文本
    if (scanningProgress.scannedCount > 0) {
      scanningProgress.statusText = `已扫描 ${scanningProgress.scannedCount} 张，已上传 ${scanningProgress.uploadedCount} 张`;
    }

    // 如果扫描已完成但加载还在，强制关闭
    if (!scanningState.isScanning && scanningProgress.isScanning) {
      scanningProgress.isScanning = false;
      scanningProgress.statusText = "扫描完成";
      scanningProgress.progress = 100;

      // 确保加载关闭
      setTimeout(() => {
        if (ragRefInstance.value) {
          closeLoading();
        }
      }, 1000);
    }

    // 如果扫描长时间没有进展，检查是否已完成
    if (scanningProgress.isScanning) {
      const currentTime = Date.now();
      if (lastScanTime && currentTime - lastScanTime > 30000) {
        // 30秒没有新扫描，认为扫描已结束
        console.log("扫描超时，强制结束");
        scanningProgress.isScanning = false;
        scanningProgress.statusText = "扫描超时";
        closeLoading();
        clearInterval(progressInterval);
        progressInterval = null;
      }
    }
  }, 1000);
};

// 添加超时检测
let lastScanTime = 0;

// 监听扫描状态变化
watch(
  () => scanningState.scannedImages,
  newCount => {
    if (newCount > 0) {
      lastScanTime = Date.now();
    }
  },
);

// 选择纸张大小
const onChangePaperSize = (value: any) => {
  formData.paperSize = value;
  scanParams.push({
    name: "纸张尺寸",
    value: formData.paperSize,
  });
};

// 获取教师信息
const teacherId = ref("");
getInfo().then(res => {
  teacherId.value = res.data.user.identityId;
  getClassList();
});

// 获取年级字典
const getGradeList = async () => {
  await getDicts("sys_grade")
    .then(res => {
      const list = (res as any)?.data || [];
      grades.value = list.map((d: any) => ({ label: d.dictLabel, value: Number(d.dictValue) }));
    })
    .catch(err => {
      console.log(err);
    });
};
getGradeList();
const filteredClasses = ref<any>(null);
// 当前选中的完整班级对象
const selectedClassData = ref<any>(null);

// 获取班级列表
const getClassList = async () => {
  try {
    await classListAuth({
      createDept: userStore.deptId, // 学校ID
      teacherId: userStore.identityId, // 根据登陆人身份 的 教师ID
      academicYear: userStore.academicYearId, // 学年
      roleId: userStore.roleId, // 角色ID
      gradeId: formData.grade, // 年级id
    })
      .then(response => {
        if ((response as any).code === 200) {
          filteredClasses.value = [
            ...(response.data?.adminClasses || []),
            ...(response.data?.teachClasses || []),
          ];

          // 默认选择第一个班级（仅在未选择班级时）
          if (filteredClasses.value && filteredClasses.value.length > 0) {
            if (!formData.class) {
              const firstClass = filteredClasses.value[0];
              formData.class = firstClass.id;
              selectedClassData.value = firstClass;
            } else {
              // 如果已有选择，更新 selectedClassData
              const selectedClass = filteredClasses.value.find(
                (item: any) => item.id === formData.class,
              );
              if (selectedClass) {
                selectedClassData.value = selectedClass;
              }
            }
          }
        } else {
          console.error("获取班级列表失败:", (response as any).msg);
        }
      })
      .catch(err => {
        console.error("获取班级列表出错:", err);
      });
  } catch (error) {
    console.error("获取班级列表出错:", error);
  }
};
// 获取学科
const subjectData = ref<any[]>([]);
const getSubjectDictionaryData = async (type: string) => {
  try {
    let res = await getDicts(type);
    if ((res as any).code === 200 && res.data && res.data.length > 0) {
      subjectData.value = res.data;
      console.log("subjectData:", subjectData.value);
      console.log("formData.subject:", formData.subject);

      // formData.subject = res.data[0].dictValue;
    }
  } catch (error) {
    console.error("获取学科数据失败:", error);
  }
};
getSubjectDictionaryData("sys_subject");

// 加载动画实例
let ragRefInstance = ref();
const loadingFun = () => {
  // 如果已经有加载实例，先关闭
  if (ragRefInstance.value) {
    ragRefInstance.value.close();
  }
  let ragRef = ref();
  ragRefInstance.value = ElLoading.service({
    target: ragRef.value,
    body: true,
    text: `正在扫描中，请不要关闭此页面！`,
    lock: true,
  });

  // 设置加载状态
  isLoading.value = true;
};

// 关闭加载动画的函数
const closeLoading = () => {
  if (ragRefInstance.value) {
    ragRefInstance.value.close();
    ragRefInstance.value = null;
  }
  isLoading.value = false;
};

// --- 修改：监听扫描状态 ---
watch(isClose, newVal => {
  if (newVal) {
    // 关闭加载动画
    closeLoading();

    // 根据 msg 显示不同的提示
    if (msg.value.includes("成功") || msg.value.includes("完成")) {
      ElMessage.success(msg.value || "扫描完成");
      scanningProgress.isScanning = false;
      scanningProgress.statusText = "扫描完成";
      scanningProgress.progress = 100;
    } else if (msg.value.includes("失败") || msg.value.includes("错误")) {
      ElMessage.error(msg.value || "扫描失败");
      scanningProgress.isScanning = false;
      scanningProgress.statusText = "扫描失败";
    } else if (msg.value.includes("无纸")) {
      scanningProgress.isScanning = false;
      ElMessage.error(msg.value || "无纸");
      scanningProgress.statusText = "无纸";
    } else if (msg.value) {
      ElMessage.info(msg.value);
    } else {
      // 默认情况
      scanningProgress.isScanning = false;
      scanningProgress.statusText = "扫描完成";
      scanningProgress.progress = 100;
    }

    // 清理进度监控
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
  }
});

// 添加对 isLoading 的监听，确保加载状态正确
watch(isLoading, newVal => {
  if (!newVal && ragRefInstance.value) {
    // 如果 isLoading 为 false 但还有加载实例，强制关闭
    closeLoading();
  }
});

// 统一管理所有表格数据
const allTableData = reactive({
  shouldList: [], // resultType: 1 应交
  actualList: [], // resultType: 2 实交
  lackList: [], // resultType: 3 缺交
  abnormalList: [], // resultType: 4 学号重复
  otherAbnormalList: [], // resultType: 5 其他异常
  repeatList: [], // resultType: 6 重复扫描
});

// 计算当前子组件需要的数据
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

// --- 修改：监听recordId变化（扫描完成） ---
watch(recordId, newVal => {
  if (newVal) {
    scanningProgress.isScanning = false;
    scanningProgress.statusText = "扫描完成，正在获取结果...";
    scanningProgress.progress = 100;

    const scanRecordId = newVal; // recordId 就是扫描记录ID
    const subjectId = formData.subject.toString(); // 从表单数据中获取学科ID

    getscanRecord(scanRecordId).then(res => {
      if (res.code === 200) {
        if (scanRecordId && subjectId) {
          getStatistics({
            scanRecordId: scanRecordId,
            subjectId: subjectId,
          })
            .then(res => {
              console.log("统计数据获取成功：", res);

              // === 根据你提供的 JSON 结构映射数据 ===
              if ((res as any).code === 200 && res.data) {
                const data = res.data;

                // 1. 更新左侧菜单统计数字
                shouldNum.value = data.shouldNum; // 应交
                actualNum.value = data.actualNum; // 实交
                lackNum.value = data.missingNum; // 缺交 (映射 missingNum)
                abnormalNum.value = data.errorNum; // 异常 (映射 errorNum)

                // 2. 更新顶部大卡片数字
                scanned.value = data.scannedNum || 0; // 已扫描 (映射 scannedNum)
                identified.value = data.actualNum || 0; // 已识别 (通常等于实交数)

                // 3. 更新子类异常数量
                duplicateNum.value = data.duplicateNum || 0;
                otherAbnormalNum.value = data.otherAbnormalNum || 0;
                repeatScanNum.value = data.repeatScanNum || 0;
              }
            })
            .catch(err => {
              console.error("获取统计数据失败：", err);
            });
        }

        // 定义所有需要请求的类型
        // 1:应交 2:实交 3:缺交 4:学号重复 5:其他异常  6:重复扫描
        const requestTypes = [1, 2, 3, 4, 5, 6];

        // 使用 Promise.all 并发请求所有数据
        const promises = requestTypes.map(type => {
          return getHomeworkPage({
            resultType: type,
            recordId: newVal,
          }).then(res => ({ type, res }));
        });

        Promise.all(promises)
          .then(results => {
            console.log("所有列表获取成功", results);

            results.forEach(({ type, res }) => {
              // 由于res是AxiosResponse对象, 实际数据应从res.data提取
              const data = res.data || {};
              const list = data.rows || data.row || [];

              // 分发数据到对应的 store
              switch (type) {
                case 1: // 应交
                  allTableData.shouldList = list;
                  break;
                case 2: // 实交
                  allTableData.actualList = list;
                  break;
                case 3: // 缺交
                  allTableData.lackList = list;
                  break;
                case 4: // 学号重复
                  allTableData.abnormalList = list;
                  break;
                case 5: // 其他异常
                  allTableData.otherAbnormalList = list;
                  break;
                case 6: // 重复扫描
                  allTableData.repeatList = list;
                  break;
              }
            });

            scanningProgress.statusText = "扫描结果已获取";
          })
          .catch(err => {
            console.error("获取结果列表部分失败", err);
            scanningProgress.statusText = "获取结果部分失败，请刷新重试";
          });
      }
    });
  }
});

// --- 新增：刷新表格数据函数 ---
const refreshTableData = () => {
  if (!recordId.value) return;

  const currentType = parseInt(activeMenuIndex.value);
  if (currentType) {
    getHomeworkPage({
      resultType: currentType,
      recordId: recordId.value,
    }).then(res => {
      const data = res.data || {};
      const list = data.rows || data.row || [];

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
    });
  }
};

const classIdSelected = ref("");

// 组件卸载时清理
onUnmounted(() => {
  if (progressInterval) {
    clearInterval(progressInterval);
  }
  closeLoading();
  cleanupWebSocket();
});

// 初始化
initDefaultScanSettings();
</script>
