<template>
  <div>
    <div class="group relative w-full pt-10px">
      <!-- 标题 -->
      <div v-if="isExportMode" class="text-21px font-700 text-black h-32px w-full text-center">
        {{ h1 || " " }}
      </div>
      <el-input v-else v-model="h1" class="no-border-input input-title" />
      <div v-if="isTight" class="flex mt-10px border h-200px">
        <div ref="baseInfoRef" class="border-r flex w-250px relative">
          <div
            @click="visible = true"
            class="hidden absolute h-100px text-blue-500 cursor-pointer top-0 right-0 opacity-0 group-hover:opacity-100 flex flex-col align-start">
            设置头部
          </div>
          <div class="mt-2 flex flex-col items-center justify-evenly my-15px py-10px px-10px">
            <div v-for="(key, index) in shows" :class="index != shows.length - 1 ? ' ' : ''">
              {{ getLabel(key) }}：
              <span class="leading-35px">_________________</span>
            </div>
          </div>
        </div>
        <div class="border-r flex items-center justify-center">
          <div
            v-if="rightSetting.idNumberType == 'shouxie'"
            class="flex items-center justify-center border">
            <div
              v-for="(_, idx) in fillId.groups"
              :key="idx"
              class="w-40px h-40px"
              :class="idx === fillId.groups - 1 ? '' : 'border-r'"></div>
          </div>
          <div ref="idBoxRef" class="pl-5px pt-px">
            <FillBox
              v-if="rightSetting.idNumberType == 'tiantu'"
              :="fillId"
              @update:model-value="
                v => {
                  fillId.value = v;
                }
              "
              :hover-setting="true" />
          </div>
          <img
            v-if="rightSetting.idNumberType == 'tiaoma'"
            src="../image/txm.png"
            class="object-contain w-75%"
            alt="" />
        </div>
        <div ref="qrCodeRef" class="flex items-center justify-center w-190px">
          <img :src="qrcodeUrl" class="h-120px" v-if="rightSetting.showQrCode" />
        </div>
      </div>
      <div v-else class="flex mt-10px border h-200px">
        <div ref="baseInfoRef" class="border-r flex w-250px relative h-full">
          <div
            @click="visible = true"
            class="hidden absolute h-100px text-blue-500 cursor-pointer top-0 right-0 opacity-0 group-hover:opacity-100 flex flex-col align-start">
            设置头部
          </div>
          <div class="flex flex-col items-center justify-evenly h-full px-20px pb-20px">
            <div v-for="(key, index) in shows" :class="index != shows.length - 1 ? '' : ''">
              {{ getLabel(key) }}：_________________
            </div>
          </div>
        </div>
        <div
          class="border-r flex justify-center items-center w-40px bg-[#ccc]"
          style="writing-mode: vertical-rl">
          学号
        </div>
        <div class="border-r flex items-center justify-center w-[calc(100%-480px)]">
          <div
            v-if="rightSetting.idNumberType == 'shouxie'"
            ref="idBoxRef"
            class="flex items-center justify-center border">
            <div
              v-for="(_, idx) in fillId.groups"
              :key="idx"
              class="w-40px h-40px"
              :class="idx === fillId.groups - 1 ? '' : 'border-r'"></div>
          </div>
          <div v-if="rightSetting.idNumberType == 'tiantu'" ref="idBoxRef" class="pl-5px pt-px">
            <FillBox
              :="fillId"
              @update:model-value="
                v => {
                  fillId = v;
                }
              "
              :hover-setting="true" />
          </div>
          <img
            ref="idBoxRef"
            v-if="rightSetting.idNumberType == 'tiaoma'"
            src="../image/txm.png"
            class="object-contain w-75%"
            alt="" />
        </div>
        <div ref="qrCodeRef" class="flex items-center justify-center w-190px">
          <img :src="qrcodeUrl" class="h-120px" v-if="rightSetting.showQrCode" />
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
import { computed, inject, onMounted, ref, watch } from "vue";
import FillBox from "./FillBox.vue";
import { getPosition, getRelativePercentageByDirectionalPoint } from "../utils/getPosition";
import { nextTick } from "vue";

const props = withDefaults(
  defineProps<{
    pageBox?: Object;
    pageOf: number;
    paperSize: string;
    qrCodeId: string;
    qrCodePrefix: string;
  }>(),
  {},
);

const rightSetting = inject<any>("AnswerCardSetting");
const isExportMode = inject<any>("isExportMode");
const qrCodeParams = defineModel<any>("qrCodeParams", {
  default: "",
});

const isTight = computed(() => {
  return ["A3_3"].includes(props.paperSize);
});
const qrcodeUrl = ref("");

const generateQRCode = async () => {
  try {
    const initUrl = await QRCode.toDataURL("占位专用,正式数据将在保存后生成", {
      width: 190, // 二维码宽度
      height: 190, // 二维码高度
      margin: 1, // 二维码边距
      colorDark: "#000000", // 二维码颜色
      colorLight: "#FFFFFF", // 背景色
    });
    qrcodeUrl.value = initUrl;
    if (!props.qrCodePrefix) return;
    if (!props.qrCodeId) return;
    const id = props.qrCodeId;
    qrCodeParams.value = `${props.qrCodePrefix}${id}`;
    await nextTick();
    const url = await QRCode.toDataURL(qrCodeParams.value, {
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

watch([() => props.qrCodePrefix, () => props.qrCodeId], generateQRCode, {
  immediate: true,
  deep: true,
});

const visible = ref(false);

const h1 = defineModel<any>("h1");
const fillId = defineModel<any>("fillId");
const idBoxInfo = defineModel<any>("idBoxInfo");
const baseInfo = defineModel<any>("baseInfo");
const qrCodeInfo = defineModel<any>("qrCodeInfo");
const shows = defineModel("shows", {
  default: [],
});

const options = [
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
    label: "组别",
    value: "组别",
  },
  {
    label: "学号",
    value: "学号",
  },
];

const emits = defineEmits(["delete", "end"]);
onMounted(() => {
  nextTick(() => emits("end"));
});
const getLabel = (key: string) => {
  return options.find(item => item.value === key)?.label;
};

const idBoxRef = ref<HTMLDivElement>();
const baseInfoRef = ref<HTMLDivElement>();
const qrCodeRef = ref<HTMLDivElement>();

const LTInfo = defineModel<any>("LTInfo");
const LBInfo = defineModel<any>("LBInfo");
const RBInfo = defineModel<any>("RBInfo");

const getBoxPositon = async () => {
  const rectP: any = await getPosition(props.pageBox as HTMLElement, idBoxRef.value, "none");
  const rectB: any = await getPosition(props.pageBox as HTMLElement, baseInfoRef.value, "none");
  const rectQ: any = await getPosition(props.pageBox as HTMLElement, qrCodeRef.value, "none");
  if (rectP) idBoxInfo.value = { ...rectP.percentage, pageOf: props.pageOf + 1 };
  if (rectB) baseInfo.value = { ...rectB.percentage, pageOf: props.pageOf + 1 };
  if (rectQ) qrCodeInfo.value = { ...rectQ.percentage, pageOf: props.pageOf + 1 };

  const LT = getRelativePercentageByDirectionalPoint(props.pageBox as HTMLElement, {
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
