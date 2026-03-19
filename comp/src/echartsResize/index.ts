import { onMounted, onBeforeUnmount } from "vue";

/**
 * 自动响应 echarts 图表大小变化
 * @param {Object} chartInstance echarts 实例对象
 */
export function echartsResize(chartInstance: any) {
  const resizeHandler = () => {
    if (chartInstance && chartInstance.resize) {
      chartInstance.resize();
    }
  };

  onMounted(() => {
    window.addEventListener("resize", resizeHandler);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("resize", resizeHandler);
  });
}
