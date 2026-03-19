import FileSaver from "file-saver";
import axios from "axios";
import { ElMessage, ElLoading } from "element-plus";
import { getToken } from "../auth";

// 下载相关接口的类型定义
export interface DownloadItem {
  id: number;
  title: string;
  ossId?: number;
  resourceType?: number | string;
  [key: string]: any;
}

// 获取环境变量的基础URL
const getBaseUrl = () => {
  // 兼容不同环境的写法
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env.VITE_APP_BASE_API;
  }
  // 备用方案：从全局变量或其他方式获取
  return (window as any).__APP_BASE_API__ || "/api";
};

// 获取客户端ID
const getClientId = () => {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env.VITE_APP_CLIENT_ID;
  }
  return (window as any).__APP_CLIENT_ID__ || "";
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

// 获取全局请求头
const getGlobalHeaders = () => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  return {
    // Authorization: token ? `Bearer ${token}` : "",
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
    clientid: getClientId(),
  };
};

// 获取资源的ossId
const getOssId = (item: DownloadItem): number | undefined => {
  return item.ossId || item.id;
};

// 获取资源名称用于下载文件名
const getDownloadFileName = (item: DownloadItem): string => {
  return item.title || "download";
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

// 添加下载记录
const addDownloadRecord = async (items: DownloadItem[]): Promise<void> => {
  try {
    const baseUrl = getBaseUrl();
    const recordData = items.map(item => ({
      resourceType: item.resourceType || 0,
      resourceId: item.id,
    }));

    await axios({
      method: "post",
      url: baseUrl + "/resource-center/resourceCenter/download/addList",
      data: recordData,
      headers: getGlobalHeaders(),
    });

    console.log("下载记录已添加");
  } catch (error) {
    console.error("添加下载记录失败:", error);
    // 不影响下载流程，只是记录失败
  }
};

/**
 * 单个资源下载函数
 * @param item 要下载的资源项
 * @returns Promise<boolean> 下载是否成功
 */
export const downloadSingleResource = async (
  item: DownloadItem,
  flag: string,
): Promise<boolean> => {
  try {
    const ossId = getOssId(item);
    if (!ossId) {
      ElMessage.error("无法获取文件ID");
      return false;
    }

    // 显示下载加载状态
    const downloadLoadingInstance = ElLoading.service({
      text: "正在下载数据，请稍候",
      background: "rgba(0, 0, 0, 0.7)",
    });

    try {
      // 调用单个文件下载接口
      const baseUrl = getBaseUrl();
      const url = baseUrl + "/system-center/resource/oss/download/" + ossId;
      const response = await axios({
        method: "get",
        url: url,
        responseType: "blob",
        headers: getGlobalHeaders(),
      });

      // 验证响应数据是否为blob
      const isBlob = blobValidate(response.data);
      if (isBlob) {
        // 获取文件名
        const filename =
          response.headers["download-filename"] || getDownloadFileName(item) || "download";

        // 创建下载
        const blob = new Blob([response.data], { type: "application/octet-stream" });
        FileSaver.saveAs(blob, decodeURIComponent(filename));

        ElMessage.success("下载开始");
        
        if (flag === "0") {
          // 不需要下载记录
          return true
        } else if (flag == "1") {
          // 个备/集备资料下载
        } else {
          // 添加下载记录
          await addDownloadRecord([item]);
        }

        return true;
      } else {
        // 处理错误响应
        await printDownloadError(response.data);
        return false;
      }
    } finally {
      downloadLoadingInstance.close();
    }
  } catch (error: any) {
    console.error("下载失败:", error);
    ElMessage.error("下载失败，请稍后重试");
    return false;
  }
};

/**
 * 批量资源下载函数
 * @param items 要下载的资源项数组
 * @returns Promise<boolean> 下载是否成功
 */
export const downloadMultipleResources = async (
  items: DownloadItem[],
  flag: string,
): Promise<boolean> => {
  try {
    // 获取所有选中资源的 ossId
    const ossIds = items.map(item => getOssId(item)).filter(id => id !== undefined && id !== null);

    if (ossIds.length === 0) {
      ElMessage.error("无法获取文件ID");
      return false;
    }

    // 显示下载加载状态
    const downloadLoadingInstance = ElLoading.service({
      text: "正在下载数据，请稍候",
      background: "rgba(0, 0, 0, 0.7)",
    });

    try {
      // 调用批量下载接口，用逗号拼接ossIds
      const baseUrl = getBaseUrl();
      const url = baseUrl + "/system-center/resource/oss/downloadByOssIds/" + ossIds.join(",");
      const response = await axios({
        method: "get",
        url: url,
        responseType: "blob",
        headers: getGlobalHeaders(),
      });

      // 验证响应数据是否为blob
      const isBlob = blobValidate(response.data);
      if (isBlob) {
        // 批量下载通常是一个zip文件
        const filename =
          response.headers["download-filename"] || `世纪金榜AI资料${new Date().getTime()}.zip`;

        // 创建下载
        const blob = new Blob([response.data], { type: "application/zip" });
        FileSaver.saveAs(blob, decodeURIComponent(filename));
        if (flag == "1") {
          // 个备/集备资料下载
        } else {
          // 添加下载记录
          await addDownloadRecord(items);
        }

        ElMessage.success(`开始下载 ${ossIds.length} 个文件`);
        return true;
      } else {
        // 处理错误响应
        await printDownloadError(response.data);
        return false;
      }
    } finally {
      downloadLoadingInstance.close();
    }
  } catch (error: any) {
    console.error("批量下载失败:", error);
    ElMessage.error("批量下载失败，请稍后重试");
    return false;
  }
};

/**
 * 通用下载函数 - 自动判断单个还是批量下载
 * @param items 要下载的资源项，可以是单个项目或数组
 * @returns Promise<boolean> 下载是否成功
 */
export const downloadResources = async (items: DownloadItem | DownloadItem[]): Promise<boolean> => {
  if (Array.isArray(items)) {
    if (items.length === 1) {
      return await downloadSingleResource(items[0]);
    } else {
      return await downloadMultipleResources(items);
    }
  } else {
    return await downloadSingleResource(items);
  }
};

// 导出工具函数供其他地方使用
export { blobValidate, getGlobalHeaders, getOssId, getDownloadFileName, printDownloadError };
