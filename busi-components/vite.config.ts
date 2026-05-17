import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueSetupExtend from "vite-plugin-vue-setup-extend";
import UnoCSS from "unocss/vite";
import vueJsx from "@vitejs/plugin-vue-jsx";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";
import Inspect from "vite-plugin-inspect";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueSetupExtend(),
    UnoCSS(),
    AutoImport({
      imports: ["vue"],
      resolvers: [
        ElementPlusResolver(),
        IconsResolver({
          prefix: "Icon",
        }),
      ],
      dts: "./src/types/auto-imports.d.ts",
    }),
    Components({
      resolvers: [
        ElementPlusResolver(),
        IconsResolver({
          // enabledCollections: ['ep'], //  @iconify-json/ep
        }),
      ],
      dts: "./src/types/components.d.ts", // 指定类型声明文件的存储位置
    }),
    Icons({
      autoInstall: true,
    }),
    Inspect(),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@busi-components": resolve(__dirname, "src"),
      // 如果需要引用 components 包
      "@sjjb/components": resolve(__dirname, "../components/src"),
      "@sjjb/utils": resolve(__dirname, "../utils/src"),
      "@sjjb/im-communication": resolve(__dirname, "../im-communication/src"),
    },
  },
  build: {
    lib: {
      entry: "./src/index.ts", // 确保与实际入口文件一致
      name: "@sjjb/busi-components", // 统一组件库名称
      fileName: format => `index.${format}.js`,
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        globals: {
          vue: "Vue",
        },
      },
    },
    outDir: "dist",
  },
  css: {
    preprocessorOptions: {},
  },
});
