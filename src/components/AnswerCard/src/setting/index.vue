<template>
  <Card :body-style="{ padding: '0', overflow: 'hidden' }">
    <div
      ref="draggableAreaRef"
      class="right-title flex justify-between items-center"
      style="border-bottom: 1px solid #ebeef5">
      <div>题卡设置</div>
      <div>
        <slot name="right-title-slot"></slot>
      </div>
    </div>
    <!--    <ElScrollbar height="630px">-->
    <ElCollapse style="width: 99%" :model-value="['list', 'base', 'structural', 'submit', 'score']">
      <!-- 基本设置 -->
      <ElCollapseItem name="base" v-if="props.showMoudle.includes('base')">
        <template #title>
          <div class="right-title">基本设置</div>
        </template>
        <BaseModule
          :show-set-info="props.showSetInfo"
          :show-setting="props.showSetting"
          v-model:data="data"
          v-model:setting="setting" />
      </ElCollapseItem>
      <!-- 题目结构 -->
      <ElCollapseItem name="structural" v-if="props.showMoudle.includes('structural')">
        <template #title>
          <div class="right-title">题目结构</div>
        </template>
        <StructuralModule v-model:data="data" v-bind:max-question-number="maxQuestionNumber" />
      </ElCollapseItem>
      <!-- 题目分值 -->
      <ElCollapseItem name="score" v-if="props.showMoudle.includes('score')">
        <template #title>
          <div class="right-title">题目分值</div>
        </template>
        <ScoreModule v-model:data="data" />
      </ElCollapseItem>
      <!-- 三方 -->
      <ElCollapseItem name="score" v-if="props.showMoudle.includes('thirdParty')">
        <template #title>
          <div class="right-title">模板设置</div>
        </template>
        <ThirdParty v-model:data="data" v-model:max-question-number="maxQuestionNumber" />
      </ElCollapseItem>
      <!-- 操作 -->
      <ElCollapseItem name="submit" v-if="props.showMoudle.includes('submit')">
        <template #title>
          <div class="right-title">操作</div>
        </template>
        <div class="px-20px flex">
          <slot name="submit"></slot>
        </div>
      </ElCollapseItem>
    </ElCollapse>
    <!--    </ElScrollbar>-->
  </Card>
</template>

<script setup name="ScoreBoard" lang="tsx">
import { Card } from "@sjjb/components";
import { ElCollapse } from "element-plus";
import { computed, provide, ref } from "vue";
import BaseModule from "./module/base.vue";
import StructuralModule from "./module/structural.vue";
import ScoreModule from "./module/score.vue";
import ThirdParty from "./module/thirdParty.vue";

const props = withDefaults(
  defineProps<{
    nextPage?: number;
    showMoudle?: ("base" | "structural" | "submit" | "score" | "thirdParty")[];
    showSetInfo?: boolean;
    showSetting?: (
      | "showQrCode"
      | "contentBorder"
      | "lineType"
      | "showAbsentFlag"
      | "objectiveMerge"
      | "objectiveAnswerType"
      | "idNumberType"
      | "sortType"
      | "objectiveDirection"
      | "fillBlankMergeReview"
      | "idNumberTypeZY"
      | "cardStyle"
    )[];
  }>(),
  {
    nextPage: 0,
    // @ts-ignore
    showMoudle: ["base", "structural", "submit"],
    // @ts-ignore
    showSetting: ["idNumberType", "sortType"],
    showSetInfo: false,
  },
);

const setting = defineModel<any>("setting", {});
const data = defineModel<any[]>("data", {});

const maxQuestionNumber = defineModel("maxQuestionNumber", {
  default: 0,
});
provide("maxQuestionNumber", maxQuestionNumber);
</script>

<style lang="scss" scoped>
.right-title {
  cursor: pointer;
  padding: 15px;
  font-family:
    Source Han Sans,
    Source Han Sans;
  font-weight: 500;
  font-size: 16px;
  color: #333333;
  line-height: 24px;
  text-align: left;
  font-style: normal;
  text-transform: none;
}

:deep(.el-collapse-item__header) {
  width: 98%;
  // border-bottom: 1px solid #d8d8d8;
}
.form-box {
  .el-form-item {
    margin-bottom: 5px;
  }
}
</style>
<style lang="scss">
.el-input-score {
  .el-input__inner {
    text-align: center;
  }
}
</style>
