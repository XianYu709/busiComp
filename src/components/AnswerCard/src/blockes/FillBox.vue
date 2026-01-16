<template>
  <div
    class="flex relative group"
    :class="[
      defaultSetting.direction === 'horizontal' ? 'flex-col items-start ' : 'justify-start',
      defaultSetting.border ? 'border' : '',
    ]">
    <div
      v-for="(groupSetting, index) in renderGroups"
      :key="index"
      class="flex items-center h-full"
      :class="getRowOrColumnsClass(index)"
      :ref="el => setInfo(el, groupSetting)">
      <!-- 前缀 -->
      <template
        v-if="defaultSetting.prefix || groupSetting.prefix || defaultSetting.prefixType !== 'hide'">
        <div class="w-27px flex justify-center items-center" :class="getPrefixBorderClass()">
          {{ getPrefixText(groupSetting, index) }}
        </div>
      </template>
      <!-- 内容 -->
      <div
        v-for="item in getRenderItems(groupSetting)"
        :key="item"
        class="w-25px text-14px flex items-center"
        :class="groupSetting.direction === 'horizontal' ? 'mr-2px h-22px' : 'mb-3px px-2px'">
        <div
          v-if="groupSetting.contentStyle === '[]'"
          class="w-full flex justify-between items-center">
          <span>[</span>
          <span class="text-13px">{{ item }}</span>
          <span>]</span>
        </div>

        <div
          v-if="groupSetting.contentStyle === 'box'"
          style="border: 1px solid black"
          class="flex justify-center items-center h-13px w-30px">
          <span class="text-13px">{{ item }}</span>
        </div>
      </div>
    </div>

    <!-- hover 设置 -->
    <div
      v-if="defaultSetting.hoverSetting"
      class="opacity-0 group-hover:opacity-100 absolute top-100% right-0 flex">
      <el-button text @click="visible = true">设置填涂区</el-button>
    </div>
  </div>

  <!-- 配置弹窗 -->
  <el-dialog v-model="visible" width="500" title="编辑设置" destroy-on-close>
    <el-form label-width="100px" label-position="left" :model="defaultSetting">
      <el-form-item label="排列方向">
        <el-radio-group v-model="defaultSetting.direction">
          <el-radio label="horizontal">横向</el-radio>
          <el-radio label="vertical">纵向</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="显示边框">
        <el-switch v-model="defaultSetting.border" />
      </el-form-item>

      <el-form-item label="内容样式">
        <el-radio-group v-model="defaultSetting.contentStyle">
          <el-radio label="box">方框</el-radio>
          <el-radio label="[]">中括号</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="内容类型">
        <el-radio-group v-model="defaultSetting.contentType">
          <el-radio label="number">数字</el-radio>
          <el-radio label="letter">字母</el-radio>
          <el-radio label="judge">判断</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="每组长度">
        <el-input-number
          v-model="defaultSetting.length"
          :min="1"
          :max="20"
          controls-position="right" />
      </el-form-item>

      <el-form-item label="组数">
        <el-input-number
          v-model="defaultSetting.gourps"
          :min="1"
          :max="20"
          controls-position="right" />
      </el-form-item>

      <el-form-item label="前缀类型">
        <el-radio-group v-model="defaultSetting.prefixType">
          <el-radio label="none">不显示</el-radio>
          <el-radio label="index">索引</el-radio>
          <el-radio label="hide">隐藏</el-radio>
        </el-radio-group>
      </el-form-item>

      <div class="flex justify-end">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="visible = false">确定</el-button>
      </div>
    </el-form>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive, useAttrs } from "vue";
import { getPosition } from "../utils/getPosition";

type propsType = {
  contentStyle?: "box" | "[]";
  contentType?: "number" | "letter" | "judge";
  length?: number;
  gourps?: number;
  direction?: "vertical" | "horizontal";
  border?: boolean;
  prefixType?: "index" | "none" | "hide";
  prefix?: string;
  indexList?: string | number[];
  hoverSetting?: boolean;
  contentList?: string[]; // 全局自定义字符
  everySetting?: (Omit<propsType, "everySetting" | "hoverSetting" | "border" | "gourps"> & {
    contentList?: string[];
  })[]; // 每组自定义字符
};

const props = withDefaults(defineProps<propsType>(), {
  hoverSetting: false,
  contentStyle: "[]",
  contentType: "number",
  length: 10,
  gourps: 5,
  direction: "horizontal",
  border: true,
  prefixType: "none",
});

const emit = defineEmits(["update:modelValue"]);

const defaultSetting = ref<propsType>({
  hoverSetting: false,
  contentStyle: "box",
  contentType: "number",
  length: 10,
  gourps: 5,
  direction: "horizontal",
  border: true,
  prefixType: "none",
});

// 默认字符池
const contentMap = ref<Record<string, any[]>>({
  number: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  letter: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
  judge: ["T", "F"],
});

// 监听 props，合并 defaultSetting
watch(
  () => props,
  val => {
    defaultSetting.value = { ...defaultSetting.value, ...val };
  },
  { deep: true, immediate: true },
);

// 双向绑定
watch(defaultSetting, val => emit("update:modelValue", val), { deep: true });

const renderGroups = computed(() => {
  const base = defaultSetting.value;
  if (base.everySetting?.length) {
    return base.everySetting.map(item => {
      return new Proxy(item, {
        get(target, key) {
          return key in target ? target[key] : base[key];
        },
      });
    });
  }
  return Array.from({ length: base.gourps }, () => base);
});

// 获取每组前缀
const getPrefixText = (groupSetting: any, index: number) => {
  if (defaultSetting.value.prefix) return defaultSetting.value.prefix;
  if (groupSetting.prefix) return groupSetting.prefix;
  if (groupSetting.prefixType === "none" && !props.prefix) return "";
  if (groupSetting.prefixType === "index") return index + 1;
  return "";
};

// ⭐ 核心：每组内容生成（支持组内、全局、自带三层优先级）
const getRenderItems = (groupSetting: any) => {
  // ① 每组独立 contentList
  if (groupSetting.contentList?.length > 0) {
    return groupSetting.contentList;
  }

  // ② 全局 contentList
  if (props.contentList?.length > 0) {
    return props.contentList;
  }

  // ③ 默认字符池（需要按 length 裁剪）
  const type = groupSetting.contentType || defaultSetting.value.contentType;
  const src = contentMap.value[type] || [];
  return src.slice(0, groupSetting.length);
};

const getPrefixBorderClass = () => {
  if (!defaultSetting.value.border) return "";
  if (defaultSetting.value.direction === "horizontal") {
    return "border-r mr-4px h-110%";
  } else {
    return "border-b mb-4px h-23px";
  }
};

const getRowOrColumnsClass = (index: number) => {
  const base = defaultSetting.value;
  const max = renderGroups.value.length;
  const isHorizontal = base.direction === "horizontal";
  const baseClass = isHorizontal ? "" : "flex-col";
  let borderClass = "";

  if (base.border) {
    borderClass = isHorizontal
      ? index < max - 1
        ? "border-b"
        : ""
      : index < max - 1
        ? "border-r"
        : "";
  }

  return `${baseClass} ${borderClass}`.trim();
};

const visible = ref(false);

const attrs = useAttrs();
const setInfo = async (el, item) => {
  if (attrs?.pageBox) {
    const rect: any = await getPosition(attrs.pageBox as HTMLElement, el, "none");
    if (rect?.percentage) {
      item.infoList = [
        {
          ...rect.percentage,
          pageOf: Number(attrs.pageOf) + 1,
        },
      ];
    }
  }
};
</script>

<style scoped>
.border-b {
  border-bottom: 1px solid #000;
}
.border-r {
  border-right: 1px solid #000;
}
.border {
  border: 1px solid #000;
}
</style>
