import type { App } from "vue";
import CommunicationDialog from "./src/index.vue";

// 确保组件有 name 属性
const name = CommunicationDialog.name || "CommunicationDialog";

// 为组件添加 install 方法
CommunicationDialog.install = (app: App) => {
  app.component(name, CommunicationDialog);
};

// 导出组件
export { CommunicationDialog };

// 导出插件
export default {
  install(app: App) {
    app.component(name, CommunicationDialog);
  },
  CommunicationDialog,
};