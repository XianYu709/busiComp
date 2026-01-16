<template>
  <!-- <div v-if="props.isShowTitle" class="my-top-title">
    <span>这是大标题,有两条内容才显示</span>
  </div> -->
  <Card 
    v-if="props.type === 'table'" 
    :id="props.domId"
    :title="props.title" 
    :show-icon="false" 
    showTitleBottomLine 
    class="my-card-list" 
    :class="props.isRadius ? 'isRadiusCard' : ''"
  >
    <template #action>
      <div class="flex items-center">
        <div>
          <el-link underline="never" @click="">
            <img src="./images/myDown.png" class="w-24px h-24px mr-1" />
            <span>导出</span>
          </el-link>
        </div>
      </div>
    </template>
    <Core 
      ref="coreRef"
      :api="api" 
      :type="props.type" 
      :cols="cols" 
      :colsData="props.colsData"
      :rankSelectValue="props.rankSelectValue" 
    />
  </Card>
  <Card 
    v-else 
    :id="props.domId"
    :title="props.title" 
    :show-icon="false" 
    showTitleBottomLine 
    class="my-card-list" 
    :class="props.isRadius ? 'isRadiusCard' : ''"
  >
    <template #action>
      <div class="flex items-center">
        <ElRadioGroup v-model="type" class="mr-4">
          <ElRadioButton value="table">表格</ElRadioButton>
          <ElRadioButton v-if="props.type === 'bar'" value="bar">柱状图</ElRadioButton>
          <ElRadioButton v-else-if="props.type === 'line'" value="line">折线图</ElRadioButton>
          <ElRadioButton v-else-if="props.type === 'box'" value="box">箱形图</ElRadioButton>
          <ElRadioButton v-else-if="props.type === 'level'" value="level">条形图</ElRadioButton>
          <ElRadioButton v-else-if="props.type === 'radar'" value="radar">雷达图</ElRadioButton>
          <!-- <ElRadioButton v-else-if="props.type === 'pie'" value="pie">饼状图</ElRadioButton> -->

        </ElRadioGroup>
        <!-- <ElSelect
          v-show="type !== 'table'"
          v-model="fields"
          style="width: 250px"
          :options="props.cols.map(item => ({ label: item.label, value: item.prop }))" 
        /> -->

        <div style="width: 100px;" class="my-action-dialog"
          v-if="props.showDialogType === 0 || props.showDialogType === 1 || props.showDialogType === 2 || props.showDialogType === 3">
          <el-link underline="never" @click="openManyRateDialog(props.showDialogType)">
            <el-icon color="#666" class="no-inherit el-icon--left">
              <Setting />
            </el-icon>
            {{ props.showDialogType === 0 ? "设置多率" :
              props.showDialogType === 1 ? "设置等级" :
                props.showDialogType === 2 ? "设置分段" :
                  props.showDialogType === 3 ? "设置名次段" : "" }}
          </el-link>
        </div>
        <el-link underline="never" @click="">
          <img src="./images/myDown.png" class="w-24px h-24px mr-1" />
          <span>导出</span>
        </el-link>
      </div>
    </template>
    <div v-if="props.showDialogType === 4">
      <el-radio-group v-model="gradingRadio" text-color="#626aef" fill="rgb(239, 240, 253)">
        <el-radio-button label="一档线" value="1" />
        <el-radio-button label="二档线" value="2" />
      </el-radio-group>
    </div>
    <Core 
      ref="coreRef"
      :api="api" 
      :type="type" 
      :cols="tableChrtCols" 
      :showDialogType="showDialogType" 
      :colsData="tableChrtColsData"
      :fields="fields" 
      :itemLabelField="itemLabelField" 
    />
  </Card>

  <!-- 设置多率弹框 -->
  <manyRateDialog :model-value="showManyRateDialog" @handleBtn="handleManyRateBtn"></manyRateDialog>

  <!-- 设置等级 对话框 -->
  <levelDialog :model-value="showLevelDialog" @handleBtn="handleLevelBtn"></levelDialog>

  <!-- 设置 分段 对话框 -->
  <subsectionDialog :model-value="showSubsectionDialog" @handleBtn="handleSubsectionBtn"></subsectionDialog>

  <!-- 设置 名次分段 对话框 -->
  <rankDialog :model-value="showRankDialog" @handleBtn="handleRankBtn"></rankDialog>
</template>

<script setup lang="ts">
import { ref, watch, type CSSProperties, defineExpose } from "vue";
import Core from "./core.vue";
import { Card } from "@sjjb/components";
import { Setting } from '@element-plus/icons-vue'
import manyRateDialog from "./setting-dialog/manyRateDialog.vue";
import levelDialog from "./setting-dialog/LevelDialog.vue";
import subsectionDialog from "./setting-dialog/SubsectionDialog.vue"
import rankDialog from "./setting-dialog/RankDialog.vue"

const props = withDefaults(
  defineProps<{
    bodyStyle?: CSSProperties,
    title: string;
    api: () => Promise<any>;
    cols: any[];
    colsData: any[];
    itemLabelField: string;
    typeChat: string;
    tableChrtCols: any[],
    tableChrtColsData: any[],
    type: string,
    showDialogType: number,
    isShowTitle: boolean,
    rankSelectValue: number,
    isRadius: boolean,
    domId: string,
  }>(), {},
);
const gradingRadio = ref(1)
const type = ref<any>(props.type);
const fields = ref<any>([...props.cols.filter(it => !it.hiddenInChart).map(item => item.prop)]);

// 添加 coreRef
const coreRef = ref();

const showManyRateDialog = ref(false)
const showLevelDialog = ref(false)
const showSubsectionDialog = ref(false)
const showRankDialog = ref(false)
// 打开 设置 弹框按钮
const openManyRateDialog = async (val: number) => {
  if (val === 0) {
    // 打开 设置多率 弹框
    showManyRateDialog.value = true
  } else if (val === 1) {
    // 打开 设置等级 弹框
    showLevelDialog.value = true
  } else if (val === 2) {
    // 打开 设置分段 弹框
    showSubsectionDialog.value = true
  } else {
    showRankDialog.value = true
  }
}
// 对话框 确认、取消、关闭X 按钮处理 关闭对话框
const handleManyRateBtn = () => {
  showManyRateDialog.value = false
}
// 对话框 确认、取消、关闭X 按钮处理 关闭对话框
const handleLevelBtn = () => {
  showLevelDialog.value = false
}
const handleSubsectionBtn = () => {
  showSubsectionDialog.value = false
}
const handleRankBtn = () => {
  showRankDialog.value = false
}

// 添加 refresh 方法，透传给 Core 组件
const refresh = async () => {
  if (coreRef.value?.refresh) {
    await coreRef.value.refresh();
  }
};

// 暴露方法给父组件
defineExpose({
  refresh,
  coreRef
});

</script>

<style lang="scss" scoped>
.my-top-title {
  height: 42px;
  line-height: 42px;
  border-radius: 10px 10px 0px 0px;
  background-color: #F7F7F7;
  padding-left: 20px;
  font-size: 18px;
  font-weight: 500;
}

.my-card-list {
  margin-bottom: 20px;
}

.isRadiusCard {
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
}
</style>
