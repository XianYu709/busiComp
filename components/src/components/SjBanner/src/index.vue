<script setup lang="ts">
defineOptions({ name: "SjBanner" });
// 定义组件的 props
interface BannerProps {
  title?: string; // 标题
  description?: string; // 描述
  showIcon?: boolean; // 是否显示图标
}

withDefaults(defineProps<BannerProps>(), {
  title: "",
  description: "",
  showIcon: true,
});
</script>

<template>
  <div
    class="sj-banner rounded-lg shadow-[0px_1px_3px_1px_rgba(0,0,0,0.2)] rounded-2.5 h-80px px-20px">
    <!-- 左侧区域：图标和标题 -->
    <div class="banner-left">
      <slot name="icon">
        <div v-if="showIcon" class="banner-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round" />
            <path
              d="M2 17L12 22L22 17"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round" />
            <path
              d="M2 12L12 17L22 12"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </div>
      </slot>
      <slot name="title">
        <div class="text-h2 text-text-title" v-if="title">{{ title }}</div>
      </slot>
    </div>

    <!-- 中间区域：描述内容 -->
    <div class="banner-center">
      <slot name="description">
        <div class="text-text-assist text-content" v-if="description">{{ description }}</div>
      </slot>
    </div>
    <div class="right-img"></div>

    <!-- 右侧区域：按钮或其他内容 -->
    <div class="banner-right">
      <slot name="action"></slot>
    </div>
  </div>
</template>

<style scoped>
.sj-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f0f4f7;
  position: relative;
}

.right-img {
  position: absolute;
  right: 70px;
  top: 0;
  width: 530px;
  height: 100%;
  background-image: url("../src/img/bg.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  z-index: 0;
}

.banner-left {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 20px;
}

.banner-icon {
  color: #1890ff;
}

.banner-center {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  margin: 0 24px;
  z-index: 1;
  margin-right: 360px;
}

.banner-description {
  font-size: 14px;
  color: #666;
  text-align: right;
  z-index: 0;
}

.banner-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  z-index: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sj-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .banner-center {
    width: 100%;
    justify-content: flex-start;
    margin: 0;
  }

  .banner-description {
    text-align: left;
  }
}
</style>
