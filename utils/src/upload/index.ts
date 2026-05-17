import { ElMessage } from "element-plus";
import { getToken } from "../auth/index.ts";

// 文件上传配置接口
export interface UploadConfig {
  uploadUrl?: string;
  headers?: Record<string, any>;
  maxFileSize?: number; // MB
  maxFileCount?: number;
  acceptTypes?: string[];
  getBusinessId?: () => Promise<any>;
}

// 文件项接口
export interface FileItem {
  name: string;
  url: string;
  ossId?: string | number;
  file?: File;
}

// 上传结果接口
export interface UploadResult {
  success: boolean;
  files: FileItem[];
  errors: string[];
}
const baseURL = import.meta.env.VITE_APP_BASE_API;

// 默认配置
const DEFAULT_CONFIG: Required<UploadConfig> = {
  uploadUrl: baseURL + "/system-center/resource/oss/uploadByBusinessId",
  headers: {},
  maxFileSize: 5, // 5MB
  maxFileCount: 6,
  acceptTypes: ["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"],
  getBusinessId: async () => {
    throw new Error("getBusinessId function is required");
  },
};

function getUploadHeaders(customHeaders?: Record<string, any>) {
  return {
    Authorization: `Bearer ${getToken()}`,
    clientid: import.meta.env.VITE_APP_CLIENT_ID,
    ...customHeaders,
  }
}

/**
 * 文件上传工具类
 */
export class FileUploader {
  private config: Required<UploadConfig>;
  private uploadedFiles: FileItem[] = [];

  constructor(config: UploadConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 文件验证
   */
  private validateFile(file: File, currentFileCount: number): boolean {
    // 检查文件数量限制
    if (currentFileCount >= this.config.maxFileCount) {
      ElMessage.warning(`最多只能上传${this.config.maxFileCount}个文件`);
      return false;
    }

    // 检查文件类型
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (this.config.acceptTypes.length === 0) {
      return true; // 不限制文件类型
    }
    if (!fileExtension || !this.config.acceptTypes.includes(fileExtension)) {
      ElMessage.error(`只支持 ${this.config.acceptTypes.join("、")} 格式的文件！`);
      return false;
    }

    // 检查文件大小
    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB > this.config.maxFileSize) {
      ElMessage.error(`上传文件大小不能超过 ${this.config.maxFileSize}MB！`);
      return false;
    }

    return true;
  }

  /**
   * 上传单个文件
   */
  private async uploadSingleFile(file: File, businessId?: string | null): Promise<FileItem | null> {
    try {
      // 获取业务ID
      if (!businessId) {
        const response = await this.config.getBusinessId();
        businessId = (response as any)?.data ?? (response as unknown as string);
      }

      // 创建表单数据
      const formData = new FormData();
      formData.append("file", file);
      formData.append("ossBusinessId", businessId);

      // 发送上传请求
      const uploadResponse = await fetch(this.config.uploadUrl, {
        method: "POST",
        headers: getUploadHeaders(this.config.headers),
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error(`HTTP error! status: ${uploadResponse.status}`);
      }

      const result = await uploadResponse.json();

      if (result.code === 200) {
        return {
          name: result.data.fileName || file.name,
          url: result.data.url || URL.createObjectURL(file),
          ossId: result.data.ossId,
          file: file,
          ...result.data,
        };
      } else {
        throw new Error(result.msg || "上传失败");
      }
    } catch (error) {
      console.error("上传文件失败:", error);
      throw error;
    }
  }

  /**
   * 上传多个文件
   */
  async uploadFiles(
    files: File[] | FileList,
    existingFiles: FileItem[] = [],
    equaltBusinessId: boolean | string | number = false, // 是否使用相同的业务ID 按原始逻辑默认值是false, 或者指定id
  ): Promise<UploadResult> {
    const fileArray = Array.from(files);
    const result: UploadResult = {
      success: true,
      files: [...existingFiles],
      errors: [],
    };

    ElMessage.success("开始上传文件...");

    let businessId: string | null = null;

    if (typeof equaltBusinessId === "boolean" && equaltBusinessId) {
      const response = await this.config.getBusinessId();
      businessId = (response as any)?.data ?? (response as unknown as string);
    }
    if (typeof equaltBusinessId === "string" || typeof equaltBusinessId === "number") {
      businessId = equaltBusinessId;
    }

    for (const file of fileArray) {
      try {
        // 验证文件
        if (!this.validateFile(file, result.files.length)) {
          result.errors.push(`文件 ${file.name} 验证失败`);
          continue;
        }

        // 上传文件
        let uploadedFile;
        if (!equaltBusinessId) {
          uploadedFile = await this.uploadSingleFile(file);
        } else {
          uploadedFile = await this.uploadSingleFile(file, businessId);
        }

        if (uploadedFile) {
          result.files.push(uploadedFile);
          ElMessage.success(`文件 ${file.name} 上传成功`);
        }
      } catch (error) {
        const errorMsg = `文件 ${file.name} 上传失败: ${error instanceof Error ? error.message : "未知错误"}`;
        result.errors.push(errorMsg);
        ElMessage.error(errorMsg);
      }
    }

    // 如果有错误，设置为失败
    if (result.errors.length > 0) {
      result.success = false;
    }

    if (result.success && result.files.length > existingFiles.length) {
      ElMessage.success("所有文件上传完成");
    }

    return result;
  }

  /**
   * 移除文件
   */
  removeFile(files: FileItem[], index: number): FileItem[] {
    const file = files[index];
    if (file && file.url && file.url.startsWith("blob:")) {
      URL.revokeObjectURL(file.url); // 释放blob URL内存
    }
    const newFiles = [...files];
    newFiles.splice(index, 1);
    return newFiles;
  }

  /**
   * 清空所有文件
   */
  clearFiles(files: FileItem[]): void {
    files.forEach(file => {
      if (file.url && file.url.startsWith("blob:")) {
        URL.revokeObjectURL(file.url);
      }
    });
  }
}

/**
 * 文件类型判断工具函数
 */
export const fileUtils = {
  /**
   * 判断是否为图片文件
   */
  isImageFile(fileItem: FileItem): boolean {
    if (fileItem.file) {
      return /\.(jpg|jpeg|png|gif)$/i.test(fileItem.file.name);
    }
    return /\.(jpg|jpeg|png|gif)$/i.test(fileItem.name || "");
  },

  /**
   * 判断是否为PDF文件
   */
  isPdfFile(fileItem: FileItem): boolean {
    if (fileItem.file) {
      return /\.pdf$/i.test(fileItem.file.name);
    }
    return /\.pdf$/i.test(fileItem.name || "");
  },

  /**
   * 获取文件预览URL
   */
  getFilePreview(fileItem: FileItem): string {
    if (this.isImageFile(fileItem)) {
      return fileItem.url || "";
    }
    return "";
  },

  /**
   * 获取文件扩展名
   */
  getFileExtension(filename: string): string {
    return filename.split(".").pop()?.toUpperCase() || "";
  },
};

/**
 * 创建文件上传器的工厂函数
 */
export function createFileUploader(config: UploadConfig = {}): FileUploader {
  return new FileUploader(config);
}

// 默认导出
export default {
  FileUploader,
  fileUtils,
  createFileUploader,
};
