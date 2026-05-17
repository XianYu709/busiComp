<template>
  <div class="pt-10px">
    <div class="group relative w-full">
      <div
        class="absolute top-0 right-0 opacity-0 group-hover:opacity-100 flex flex-col align-start">
        <div class="pointer-events-auto z-99">
          <el-button @click="visible = true" text>设置头部</el-button>
        </div>
      </div>

      <div class="flex justify-between w-full">
        <div>
          <img :src="qrcodeUrl" class="w-70px" v-if="rightSetting.showQrCode" />
        </div>
        <div
          class="flex flex-col items-center justify-center w-full"
          :class="rightSetting.showQrCode ? '-ml-70px' : ''">
          <!-- 标题 -->
          <div v-if="isExportMode" class="text-21px font-700 text-black h-32px w-full text-center">
            {{ h1 || " " }}
          </div>
          <el-input v-else v-model="h1" class="no-border-input input-title" />
          <div v-if="isExportMode" class="text-18px text-black h-32px">
            {{ h2 || " " }}
          </div>
          <el-input v-else v-model="h2" class="no-border-input input-subtitle" />
        </div>
        <div></div>
      </div>
      <div v-if="!isTight" class="mt-2 flex py-15px" ref="baseInfoRef">
        <div v-for="(key, index) in shows" :class="index != shows.length - 1 ? ' mr-2' : ''">
          {{ getLabel(key) }}.__________
        </div>
      </div>
      <div class="flex justify-between">
        <div v-if="!isTight" class="border flex mr-10px w-[calc(100%-10px)]">
          <div
            class="border-r flex justify-center items-center w-8%"
            style="writing-mode: vertical-rl">
            注 意 事 项
          </div>
          <div class="content px-2">
            <Block v-model="warning" :border="false" :minHeight="100" />
          </div>
        </div>
        <div v-else class="flex justify-evenly flex-col" ref="baseInfoRef">
          <div v-for="(key, index) in shows" :class="index != shows.length - 1 ? ' mb-2' : ''">
            {{ getLabel(key) }}.____________
          </div>
        </div>
        <div
          v-if="rightSetting.idNumberType == 'tiaoma'"
          ref="idBoxRef"
          class="border flex w-45% justify-center items-center">
          <img src="../image/txm.png" class="w-90% h-auto" alt="" />
        </div>
        <div v-if="rightSetting.idNumberType == 'tiantu'" class="flex" ref="idBoxRef">
          <div
            class="px-4px text-16px flex justify-center items-center"
            style="writing-mode: vertical-rl; border: 1px solid black; border-right: none">
            准 考 证 号
          </div>
          <FillBox
            :hover-setting="true"
            :="fillId"
            @update:model-value="
              v => {
                fillId = v;
              }
            "></FillBox>
        </div>
      </div>
      <div class="h-10px w-full"></div>
      <div v-if="isTight" class="border flex w-full">
        <div
          class="border-r flex justify-center items-center w-8%"
          style="writing-mode: vertical-rl">
          注 意 事 项
        </div>
        <div class="content px-2">
          <Block v-model="warning" :border="false" :minHeight="100" />
        </div>
      </div>
      <div
        v-if="isTight && rightSetting.showAbsentFlag"
        class="w-full flex px-2 text-15px box-border"
        style="border: 1px solid black; border-top: none">
        <div class="border-r h-full py-2 px-2">缺考标记</div>
        <div class="py-2 pl-2" ref="flagBoxRef">[ &nbsp;&nbsp;&nbsp;]</div>
      </div>
      <div class="border" v-if="!isTight && rightSetting.showAbsentFlag">
        <div class="absent-l">此栏考生禁填</div>
        <div class="absent-r">
          缺考标记：
          <span ref="flagBoxRef">[ &nbsp;&nbsp;&nbsp;]</span>
          &nbsp; 缺考考生由监考员填涂考号，并用2B铅笔填涂缺考标记
        </div>
      </div>
    </div>
    <el-dialog v-model="visible" width="500" title="编辑" destroy-on-close>
      <el-checkbox-group v-model="shows">
        <el-checkbox
          v-for="item in options"
          :label="item.label"
          :disabled="item.disabled"
          :value="item.value" />
      </el-checkbox-group>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import QRCode from "qrcode";
import { computed, inject, nextTick, onMounted, ref, watch } from "vue";
import Block from "../base/Block.vue";
import FillBox from "./FillBox.vue";
import { getPosition, getRelativePercentageByDirectionalPoint } from "../utils/getPosition";

const props = withDefaults(
  defineProps<{
    qrCodeParams: Object;
    pageBox?: Object;
    pageOf: number;
    paperSize: string;
  }>(),
  {},
);

const rightSetting = inject<any>("AnswerCardSetting");
const isExportMode = inject<any>("isExportMode");

const qrcodeUrl = ref("");
const isTight = computed(() => {
  return ["A3_3"].includes(props.paperSize);
});

const generateQRCode = async () => {
  try {
    const url = await QRCode.toDataURL(props.qrCodeParams, {
      width: 190, // 二维码宽度
      height: 190, // 二维码高度
      margin: 1, // 二维码边距
      colorDark: "#000000", // 二维码颜色
      colorLight: "#FFFFFF", // 背景色
    });
    qrcodeUrl.value = url;
  } catch (error) {
    console.error("生成二维码时出错:", error);
  }
};

watch(
  () => props.qrCodeParams,
  () => {
    props?.qrCodeParams && generateQRCode();
  },
  {
    immediate: true,
  },
);

const visible = ref(false);

const h1 = defineModel<any>("h1");
const h2 = defineModel<any>("h2");
const warning = defineModel<any>("warning");
const fillId = defineModel<any>("fillId");
const idBoxInfo = defineModel<any>("idBoxInfo");
const baseInfo = defineModel<any>("baseInfo");
const flagBoxInfo = defineModel<any>("flagBoxInfo");

const shows = defineModel("shows", {
  default: [],
});
const options = [
  {
    label: "学校",
    value: "学校",
  },
  {
    label: "姓名",
    value: "姓名",
    disabled: true,
  },
  {
    label: "班级",
    value: "班级",
  },
  {
    label: "考场",
    value: "考场",
  },
  {
    label: "座号",
    value: "座号",
  },
  {
    label: "考号",
    value: "考号",
    disabled: true,
  },
];

const emits = defineEmits(["delete", "end"]);

const getLabel = (key: string) => {
  return options.find(item => item.value === key)?.label;
};

const idBoxRef = ref<HTMLDivElement>();
const flagBoxRef = ref<HTMLDivElement>();
const baseInfoRef = ref<HTMLDivElement>();

const LTInfo = defineModel<any>("LTInfo");
const LBInfo = defineModel<any>("LBInfo");
const RBInfo = defineModel<any>("RBInfo");

const getBoxPositon = async () => {
  const rectP: any = await getPosition(props.pageBox as HTMLElement, idBoxRef.value, "none");
  const rectB: any = await getPosition(props.pageBox as HTMLElement, baseInfoRef.value, "none");
  const rectF: any = await getPosition(props.pageBox as HTMLElement, flagBoxRef.value, "none");
  if (rectP) idBoxInfo.value = { ...rectP.percentage, pageOf: props.pageOf + 1 };
  if (rectB) baseInfo.value = { ...rectB.percentage, pageOf: props.pageOf + 1 };
  if (rectF) flagBoxInfo.value = { ...rectF.percentage, pageOf: props.pageOf + 1 };

  const LT = getRelativePercentageByDirectionalPoint(props.pageBox as HTMLElement as HTMLElement, {
    x: 10,
    y: 15,
  });
  const LB = getRelativePercentageByDirectionalPoint(
    props.pageBox as HTMLElement,
    {
      x: 10,
      y: 15,
    },
    "lb",
  );
  const RB = getRelativePercentageByDirectionalPoint(
    props.pageBox as HTMLElement,
    {
      x: 10,
      y: 15,
    },
    "rb",
  );
  LTInfo.value = {
    x0: LT.percentage.x,
    y0: LT.percentage.y,
    pageOf: props.pageOf + 1,
  };
  LBInfo.value = {
    x0: LB.percentage.x,
    y0: LB.percentage.y,
    pageOf: props.pageOf + 1,
  };
  RBInfo.value = {
    x0: RB.percentage.x,
    y0: RB.percentage.y,
    pageOf: props.pageOf + 1,
  };
};

onMounted(() => {
  getBoxPositon();
  nextTick(() => emits("end"));
});

const scheduleRecalculatePosition = () => {
  nextTick(() => {
    getBoxPositon();
  });
};

watch(
  () => [rightSetting?.value?.idNumberType, rightSetting?.value?.idNumber],
  scheduleRecalculatePosition,
  {
    deep: true,
  },
);

watch(
  () => [fillId.value?.groups, fillId.value?.length, fillId.value?.everySetting],
  scheduleRecalculatePosition,
  {
    deep: true,
  },
);
</script>
<style lang="scss" scoped>
.box {
  border: 1px solid black;
  margin-bottom: 10px;
  box-sizing: border-box;
  padding: 10px;
}

.border {
  border: 1px solid black;
  box-sizing: border-box;

  &:hover {
    border: 1px solid blue;
  }
}

.border-r {
  border-right: 1px solid black;
  box-sizing: border-box;

  &:hover {
    border-right: 1px solid blue;
  }
}

.absent-l {
  display: inline-block;
  width: 140px;
  height: 40px;
  //background: #E8E8E8;
  text-align: center;
  line-height: 40px;
  border-right: 1px solid #000000;
}

.absent-r {
  display: inline-block;
  padding-left: 10px;
}

/* 去掉边框、阴影、背景 */
.no-border-input :deep(.el-input__wrapper) {
  box-shadow: none !important;
  border: 1px solid transparent !important;
  /* 保留边框占位避免跳动 */
  background: transparent !important;
}

/* 聚焦时也不出现边框高亮 */
.no-border-input :deep(.el-input__wrapper.is-focus) {
  border: 1px solid blue !important;
  /* Element Plus 默认主题蓝 */
  box-shadow: none !important;
  background: transparent !important;
}

/* 标题样式 */
.input-title :deep(.el-input__inner) {
  font-size: 20px;
  font-weight: 700;
  color: #000;
  /* 黑色字体 */
  text-align: center;
}

/* 副标题样式 */
.input-subtitle :deep(.el-input__inner) {
  font-size: 18px;
  font-weight: 500;
  color: #000;
  /* 黑色字体 */
  text-align: center;
}

/* 占位文字也变成黑色半透明 */
.no-border-input :deep(.el-input__inner::placeholder) {
  color: rgba(0, 0, 0, 0.4);
}
</style>
