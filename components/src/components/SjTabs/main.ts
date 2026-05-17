import SjTabs from "./src/sj-tabs.vue";
import SjTabPane from "./src/sj-tab-pane.vue";
import type { App } from "vue";

// 确保组件有 name 属性
const tabsName = SjTabs.name || "SjTabs";
const tabPaneName = SjTabPane.name || "SjTabPane";

// 为组件添加 install 方法
SjTabs.install = (app: App) => {
  app.component(tabsName, SjTabs);
};

SjTabPane.install = (app: App) => {
  app.component(tabPaneName, SjTabPane);
};

// 导出组件
export { SjTabs, SjTabPane };

// 导出插件
export default {
  install(app: App) {
    app.component(tabsName, SjTabs);
    app.component(tabPaneName, SjTabPane);
  },
  SjTabs,
  SjTabPane,
};
