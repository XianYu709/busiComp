import Pagination from "./src/index.vue";
import type { App } from "vue";

// 确保组件有 name 属性
const name = Pagination.name || "ScoreBoard";

// 为组件添加 install 方法
Pagination.install = (app: App) => {
  app.component(name, Pagination);
};

Pagination.install = (app: App) => {
  app.component(name, Pagination);
};

// 导出组件
export { Pagination };

// 导出插件
export default {
  install(app: App) {
    app.component(name, Pagination);
  },
  Pagination,
};
