import { ElLoading, ElMessage } from 'element-plus';
import createService from '../request/createService'
import FileSaver from "file-saver";

// 获取环境变量的基础URL
const getBaseUrl = () => {
  // 兼容不同环境的写法
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env.VITE_APP_BASE_API;
  }
  // 备用方案：从全局变量或其他方式获取
  return (window as any).__APP_BASE_API__ || "/api";
};

// 验证blob数据是否有效
const blobValidate = (data: any): boolean => {
  if (data.type !== "application/json") return true;
  try {
    const text = data.text();
    JSON.parse(text);
    return false;
  } catch (e) {
    return true;
  }
};

// 处理下载错误响应
const printDownloadError = async (data: any): Promise<void> => {
  try {
    const resText = await data.text();
    const rspObj = JSON.parse(resText);
    const errMsg = rspObj.msg || rspObj.message || "下载失败";
    ElMessage.error(errMsg);
  } catch (parseError) {
    ElMessage.error("下载失败：服务器返回错误信息");
  }
};

/**
 * 从接口获取数据并导出Pdf
 */
export async function exportToPdf(_url: string, _data: any[], filename: string) {
    // 显示下载加载状态
    const downloadLoadingInstance = ElLoading.service({
      text: "正在导出数据，请稍候",
      background: "rgba(0, 0, 0, 0.7)",
    });

    try {
        // 使用 createService 创建 service 实例
        const service = createService({
          baseURL: getBaseUrl(),
          timeout: 60000, // 文件下载可能需要更长时间
        });
        
        const res = await service({
            url: _url,
            data: _data,
            method: 'post',
            responseType: "blob",
        });
        
        // 验证响应数据是否为blob
        const isBlob = blobValidate(res.data);
        if (isBlob) {

            // 2. 转换Blob为下载URL
            const blob = new Blob([res?.data], {
            // 手动指定MIME类型（与后端Content-Type一致，避免识别错误）
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            FileSaver.saveAs(blob, decodeURIComponent(filename));

            ElMessage.success("导出开始");

        } else {
            // 处理错误响应
            await printDownloadError(res.data);
        }


        // const downloadUrl = URL.createObjectURL(blob);
        // // 3. 创建<a>标签触发下载
        // const a = document.createElement('a');
        // a.href = downloadUrl;
        // a.download = filename; // 文件名（浏览器会忽略URL中的文件名，以这个为准）
        // document.body.appendChild(a);
        // a.click(); // 模拟点击下载

        // // 4. 清理资源（避免内存泄漏）
        // document.body.removeChild(a);
        // URL.revokeObjectURL(downloadUrl); // 销毁临时URL

    } catch (error) {
        downloadLoadingInstance.close();
        console.error('Error fetching data:', error);
    }
}