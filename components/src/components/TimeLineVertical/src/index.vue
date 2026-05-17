<template>
  <el-scrollbar :max-height="props.maxHeight">
    <div class="flex mx-20px py-20px">
      <div class="line"></div>
      <div class="w-[calc(100%-25px)]">
        <div class="mb-20px relative" v-for="it in props.items">
          <div class="dot"></div>
          <div class="title">
            {{ it.title }}
          </div>
          <div class="bg-#F5F6F7 p-20px mt-10px rounded-lg">{{ it.desc }}</div>
        </div>
      </div>
    </div>
  </el-scrollbar>
</template>

<script setup lang="ts" name="TimeLineVertical">
type Item = {
  id: number | string;
  title: string;
  desc: string;
};
type PropsType = { items: Item[]; maxHeight: string };

const props = withDefaults(defineProps<PropsType>(), {});

const value = defineModel();
</script>

<style lang="scss" scoped>
.line {
  border-left: 2px dashed #e8e8e8;
  margin-right: 20px;
}
.title {
  background: url("./title-bg.png") no-repeat center center;
  background-size: 100% 100%;
  width: 110px;
  height: 27px;
  color: white;
  padding-left: 20px;
  line-height: 24px;
  font-style: 14px;
}
.dot {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 4px solid #4c9fd3;
  left: -29px;
  top: 5px;
}
</style>
