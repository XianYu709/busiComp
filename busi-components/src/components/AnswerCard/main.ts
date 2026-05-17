import { defineAsyncComponent } from "vue";
import TextPage from "./src/base/index.vue";
import Block from "./src/base/Block.vue";
import View from "./src/View.vue";
import Setting from "./src/setting/index.vue";

const Edit = defineAsyncComponent(() => import("./src/base/FormulaEditor.vue"));

export default { TextPage, Block, Edit, Setting, View };
