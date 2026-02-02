<template>
  <div class="communication-dialog">
    <el-dialog 
      v-model="visible"
      width="952px"
      :destroy-on-close="true"
      :close-on-click-modal="false"
      @close="handleClose"
    >
      <div ref="imContainer" class="im-container im-component" />
      
    </el-dialog>
  </div>
</template>

<script setup>
  import { ref, watch, nextTick, onMounted } from "vue";
  import {createImChatApp} from '@sjjb/im-communication'
  import {clearImChat} from "@sjjb/im-communication"
  
  // Props-
  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },
    // 用户头像
    userAvatar: {
      type: String,
      default: "",
      required: false // 若父项目可能延迟传递，设为非必填
    },
    // 父页面 金榜杏坛 若在线 跳转时所传的信息 id账号
    comeUserInfoId: {
      type: String,
      default: ""
    },
    // 登陆信息
    comeLoginInfo: {
      type: Object,
      default: {}
    }
  });

  const myAvatar = props.userAvatar
  let myUserId = props.comeUserInfoId ? props.comeUserInfoId : ""
  const comeLoginInfo = props.comeLoginInfo?.username ? props.comeLoginInfo : {}

  // Emits
  const emit = defineEmits(["update:modelValue", "confirm", "cancel"]);

  // 挂载内容
  const imContainer = ref(null)
  // 外部项目的Vue实例
  let imApp = null
  // 响应式数据
  const visible = ref(false);

  // 当对话框显示时，初始化外部项目
  const initIM = () => {
    // console.log("容器在吗？",imContainer.value)
    console.log("接受的头像参数",myAvatar)
    console.log("接受的跳转参数",myUserId)

    if (!imApp) {
      imApp = createImChatApp({
        userAvatar: myAvatar,
        comeUserInfoId: myUserId,
        comeLoginInfo: comeLoginInfo,
      }); // 创建子项目实例
    }
    // 直接挂载（容器已就绪）
    imApp.app.mount(imContainer.value);
  }

  // 当对话框关闭时，销毁外部项目（避免内存泄漏）
  const destroyIM = () => {
    if (imApp) {
      // 调用即时通讯的方法 清除
      clearImChat()

      imApp.app.unmount()
      imApp = null

      // 处理缓存
      clearLocalStorage()
    }
  }
  const clearLocalStorage = () => {
    const storageType = ['INFORM', 'conversationList', 'search_hisory'];
    const loginUserId = "testToken123";
    const storageKey = `EASEIM_${loginUserId}`;
    storageType.map((item) => {
      return window.localStorage.removeItem(`${storageKey}_${item}`);
    });
    window.localStorage.removeItem('EASEIM_loginUser');
  };

  // 监听 comeUserInfoId 变化
  watch(() => props.comeUserInfoId,
    newVal => {
      console.log("监听 comeUserInfoId 变化",newVal)
      myUserId = newVal
    },
    { immediate: true },
  );

  // 监听 modelValue 变化
  watch(() => props.modelValue,
    newVal => {
      visible.value = newVal;
    },
    { immediate: true },
  );

  // 监听 visible 变化
  watch(visible, newVal => {
    // console.log("监听 visible 变化",newVal)
    emit("update:modelValue", newVal);
    if(newVal) {
      nextTick(() => {
        // 再次确认容器存在后初始化
        if (imContainer.value) {
          initIM();
        } else {
          console.error("imContainer 节点未找到，挂载失败");
        }
      })
    }else{
      // 关闭时销毁子项目
      destroyIM();
    }
  });

  // 关闭弹窗
  const handleClose = () => {
    // console.log("关闭弹框")
    emit("cancel");
    visible.value = false;
    destroyIM()
  };
</script>

<style scoped>
  .im-container {
    width: 100%;
    height: 100%;
    min-height: 500px; /* 给个最小高度，避免内容塌陷 */
  }
  .communication-dialog .com-dialog-body {
    height: 588px;
    border-radius: 60px;
  }
  .communication-dialog ::v-deep(.el-dialog) {
    padding: 0px;
    border-radius: 10px;

  }
  .communication-dialog :deep(.el-dialog__body){
    height: 588px;
  }
  .communication-dialog :deep(.el-dialog__body .border-t-1){
    border: 0px;
  }
  .communication-dialog ::v-deep .el-dialog__header:first-of-type {
    padding: 0px;
 
  }
  .communication-dialog :deep(.el-dialog__header .el-dialog__headerbtn){
    z-index: 10;
    width: 28px;
    height: 28px;
    margin-top: 10px;
    margin-right: 6px;
  }
</style>