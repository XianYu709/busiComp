import DictSelect from "./src/index.vue";
import getDictSelectData from "./src/getData";
import type { App } from "vue";

// 确保组件有 name 属性
const name = DictSelect.name || "DictSelect";

// 为组件添加 install 方法
DictSelect.install = (app: App) => {
  app.component(name, DictSelect);
};

DictSelect.install = (app: App) => {
  app.component(name, DictSelect);
};

// 导出组件
export { DictSelect, getDictSelectData };

// 导出插件
export default {
  install(app: App) {
    app.component(name, DictSelect);
  },
  DictSelect,
};
