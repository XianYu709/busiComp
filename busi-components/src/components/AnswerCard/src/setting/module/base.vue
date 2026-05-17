<template>
  <div class="flex flex-col items-center form-box w-full -mb-25px mt-5px">
    <el-form label-width="135px" label-position="right" :model="setting" class="w-full">
      <el-form-item
        class="-my-2"
        label="内容区边框"
        v-if="props.showSetting.includes('contentBorder')">
        <el-switch v-model="setting.contentBorder" />
      </el-form-item>
      <el-form-item class="-my-2" label="题卡样式" v-if="props.showSetting.includes('cardStyle')">
        <el-radio-group v-model="setting.cardStyle">
          <el-radio label="题卡合一" value="mergeQuestionCard"></el-radio>
          <el-radio label="纯题卡" value="onlyCard">纯题卡</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        class="-my-2"
        label="考号板式"
        v-if="props.showSetting.includes('idNumberType')">
        <el-radio-group v-model="setting.idNumberType">
          <el-radio label="填涂" value="tiantu">填涂</el-radio>
          <el-radio label="二维码" value="tiaoma">条形码</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        class="-my-2"
        label="考号板式"
        v-if="props.showSetting.includes('idNumberTypeZY')">
        <div>
          <el-radio-group v-model="setting.idNumberType">
            <el-radio label="填涂" value="tiantu">填涂</el-radio>
            <el-radio label="二维码" value="tiaoma">条形码</el-radio>
            <el-radio label="手写" value="shouxie">手写</el-radio>
          </el-radio-group>
          <div v-if="showSetInfo" class="flex items-center">
            <el-select
              size="small"
              class="mr-4 mt-2px"
              style="width: 85px"
              placeholder="考号位数"
              :options="idNumberOptions"
              v-model="setting.idNumber" />
            <SetInfo
              label="考号"
              :allowClick="!!setting.idNumber"
              :infoList="threeBaseInfo.childs[1].infoIdList" />
          </div>
        </div>
      </el-form-item>
      <el-form-item
        label="客观题作答方式"
        v-if="
          props.showSetting.includes('objectiveAnswerType') &&
          setting.cardStyle == 'mergeQuestionCard'
        ">
        <el-radio-group v-model="setting.objectiveAnswerType">
          <el-radio label="手写" value="shouxie"></el-radio>
          <!-- <el-radio label="填涂" value="tiantu"></el-radio> -->
        </el-radio-group>
      </el-form-item>
      <el-form-item
        class="-my-2"
        label="客观题排列方向"
        v-if="props.showSetting.includes('objectiveDirection') && setting.cardStyle == 'onlyCard'">
        <el-radio-group v-model="setting.objectiveDirection">
          <el-radio value="horizontal">横向</el-radio>
          <el-radio value="vertical">纵向</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item class="-my-2" label="题号排序" v-if="props.showSetting.includes('sortType')">
        <el-radio-group v-model="setting.sortType">
          <el-radio value="smallFollow">按小题接排</el-radio>
          <el-radio value="bigSingle">按大题单独排</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item class="-my-2" label="二维码" v-if="props.showSetting.includes('showQrCode')">
        <div class="flex">
          <el-switch v-model="setting.showQrCode" class="mr-4" />
          <div v-if="showSetInfo" class="flex">
            <SetInfo
              label="二维码"
              :allowClick="!!setting.showQrCode"
              :infoList="threeBaseInfo.childs[2].infoIdList" />
          </div>
        </div>
      </el-form-item>
      <el-form-item
        class="-my-2"
        label="客观题合并"
        v-if="props.showSetting.includes('objectiveMerge')">
        <el-switch
          v-model="setting.objectiveMerge"
          :disabled="
                    data!.filter(it => it.type === 'ChoiceQuestion' ).length<2
                  " />
      </el-form-item>
      <el-form-item
        label="填空题合并批阅"
        v-if="props.showSetting.includes('fillBlankMergeReview')">
        <el-switch
          v-model="setting.fillBlankMergeReview"
          :disabled="
                    data!.filter(it => it.type === 'FillBlankQuestion' ).length==0
                  " />
      </el-form-item>
      <el-form-item
        class="-my-2"
        label="缺考标记"
        v-if="props.showSetting.includes('showAbsentFlag')">
        <div class="flex">
          <el-switch v-model="setting.showAbsentFlag" class="mr-4" />
          <div v-if="showSetInfo">
            <SetInfo
              label="缺考标记"
              :allowClick="!!setting.showAbsentFlag"
              :infoList="threeBaseInfo.childs[3].infoIdList" />
          </div>
        </div>
      </el-form-item>

      <el-form-item class="-my-2" label="基本信息" v-if="showSetInfo">
        <SetInfo label="基本信息" :infoList="threeBaseInfo.childs[0].infoIdList" />
      </el-form-item>

      <el-form-item class="-my-2" label="作答横线" v-if="props.showSetting.includes('lineType')">
        <el-radio-group
          v-model="setting.lineType"
          :disabled="
                    !data!.some(it => it.type === 'FillBlankQuestion' || it.type === 'BriefQuestion' )
                  ">
          <el-radio label="solid">实线</el-radio>
          <el-radio label="dashed">虚线</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="tsx">
import { ElSelect } from "element-plus";
import { inject } from "vue";
import SetInfo from "./SetInfo";

const threeBaseInfo: any = inject("threeBaseInfo");
const setting = defineModel<any>("setting", { default: () => ({}) });
const data = defineModel<any>("data", { default: () => ({}) });
const props = withDefaults(
  defineProps<{
    showSetting: string[];
    showSetInfo?: boolean;
  }>(),
  {
    showSetInfo: false,
  },
);

const idNumberOptions = [
  {
    lable: "1 位",
    value: 1,
  },
  {
    lable: "2 位",
    value: 2,
  },
  {
    lable: "3 位",
    value: 3,
  },
  {
    lable: "4 位",
    value: 4,
  },
  {
    lable: "5 位",
    value: 5,
  },
  {
    lable: "6 位",
    value: 6,
  },
  {
    lable: "7 位",
    value: 7,
  },
  {
    lable: "8 位",
    value: 8,
  },
  {
    lable: "9 位",
    value: 9,
  },
  {
    lable: "10 位",
    value: 10,
  },
];
</script>

<style lang="scss" scoped></style>
