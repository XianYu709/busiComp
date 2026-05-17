import TableWithEcharts from "./src/index.vue";
import type { App } from "vue";

// 确保组件有 name 属性
const name = TableWithEcharts.name || "TableWithEcharts";

// 为组件添加 install 方法
TableWithEcharts.install = (app: App) => {
  app.component(name, TableWithEcharts);
};

TableWithEcharts.install = (app: App) => {
  app.component(name, TableWithEcharts);
};

// 导出组件
export { TableWithEcharts };

// 导出插件
export default {
  install(app: App) {
    app.component(name, TableWithEcharts);
  },
  TableWithEcharts,
};
