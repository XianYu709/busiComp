<template>
  <el-dialog v-model="visible" :title="title" :width="width" :append-to-body="appendToBody"
    :close-on-click-modal="closeOnClickModal" @close="handleClose" :destroy-on-close="destroyOnClose">
    <div class="border-t-1 border-t-solid border-text-divider" style="border-color: #d8d8d8">
      <!-- 弹窗内容插槽 -->
      <slot></slot>
    </div>

    <!-- 底部按钮插槽 -->
    <template #footer v-if="showButton">
      <slot name="footer">
        <!-- 默认底部按钮 -->
        <div class="dialog-footer flex justify-center gap-5">
          <!-- <el-button
            type="primary"
            @click="handleConfirm"
            class="confirm-btn w-30 h-8 rounded-1 bg-#0052d9 border-none">
            {{ confirmText }}
          </el-button> -->
          <!-- :loading="confirmLoading" ✅ 绑定 loading -->
          <sjButton variant="primary" :loading="confirmLoading" :text="confirmText" @click="handleConfirm"></sjButton>
          <!-- <el-button
            @click="handleCancel"
            class="cancel-btn w-30 h-8 rounded-1 bg-#324a6d00 border-1 border-solid border-#0052d9 color-#0052d9">
            {{ cancelText }}
          </el-button> -->
          <!-- :disabled="confirmLoading"可选：加载时禁用取消 -->
          <sjButton variant="secondary" :disabled="confirmLoading" :text="cancelText" @click="handleCancel"></sjButton>
        </div>
      </slot>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, watch } from "vue";
  import { sjButton } from "@sjjb/components";
  // Props-
  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "弹窗标题",
    },
    width: {
      type: String,
      default: "600px",
    },
    appendToBody: {
      type: Boolean,
      default: false,
    },
    closeOnClickModal: {
      type: Boolean,
      default: false,
    },
    confirmText: {
      type: String,
      default: "确认",
    },
    cancelText: {
      type: String,
      default: "返回",
    },
    showButton: {
      type: Boolean,
      default: true,
    },
    destroyOnClose: {
      type: Boolean,
      default: false,
    },
    // ✅ 新增：确认按钮 loading 状态
    confirmLoading: { type: Boolean, default: false },
  });

  // Emits
  const emit = defineEmits(["update:modelValue", "confirm", "cancel"]);

  // 响应式数据
  const visible = ref(false);

  // 监听 modelValue 变化
  watch(
    () => props.modelValue,
    newVal => {
      visible.value = newVal;
    },
    { immediate: true },
  );

  // 监听 visible 变化
  watch(visible, newVal => {
    emit("update:modelValue", newVal);
  });

  // 确认操作
  const handleConfirm = () => {
    emit("confirm");
  };

  // 取消操作
  const handleCancel = () => {
    if (props.confirmLoading) return; // 可选：加载中禁止取消
    emit("cancel");
    visible.value = false;
  };

  // 关闭弹窗
  const handleClose = () => {
    if (props.confirmLoading) return; // 可选：加载中禁止关闭
    emit("cancel");
    visible.value = false;
  };
</script>

<style scoped lang="scss">
  .upload-demo :deep(.el-upload-dragger) {
    width: 120px;
    height: 120px;
    border-radius: 8px;
    border: 2px dashed #d9d9d9;
    background-color: #fafafa;
    transition: all 0.3s ease;
  }

  .upload-demo :deep(.el-upload-dragger:hover) {
    border-color: #409eff;
    background-color: #f0f9ff;
  }

  .confirm-btn:hover {
    background: #1890ff !important;
  }

  .cancel-btn:hover {
    background: rgba(14, 95, 199, 0.1) !important;
  }
</style>