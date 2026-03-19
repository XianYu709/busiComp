# 文件上传工具

一个通用的文件上传工具，支持图片和文档的上传，带有完整的验证和错误处理。

## 功能特性

- ✅ 文件类型验证（支持 jpg、jpeg、png、gif、pdf、doc、docx）
- ✅ 文件大小限制（默认 5MB）
- ✅ 文件数量限制（默认 6 个）
- ✅ 自动获取业务 ID
- ✅ 批量上传支持
- ✅ 错误处理和重试
- ✅ 内存管理（自动释放 blob URL）

## 基本使用

### 1. 创建上传器实例

```typescript
import { createFileUploader, type FileItem } from '@/utils/src/upload'
import { getOssBusinessId } from '@/api'

// 创建上传器
const fileUploader = createFileUploader({
  getBusinessId: getOssBusinessId,
  maxFileSize: 5, // MB
  maxFileCount: 6,
  acceptTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']
})
```

### 2. 上传文件

```typescript
// 文件列表状态
const fileList = ref<FileItem[]>([])

// 处理文件选择
const handleFileChange = async (files: FileList) => {
  try {
    const result = await fileUploader.uploadFiles(files, fileList.value)
    fileList.value = result.files
    
    if (result.success) {
      console.log('所有文件上传成功')
    } else {
      console.log('部分文件上传失败:', result.errors)
    }
  } catch (error) {
    console.error('文件上传失败:', error)
  }
}
```

### 3. 移除文件

```typescript
const removeFile = (index: number) => {
  fileList.value = fileUploader.removeFile(fileList.value, index)
}
```

### 4. 使用工具函数

```typescript
import { fileUtils } from '@/utils/src/upload'

// 判断文件类型
const isImage = fileUtils.isImageFile(fileItem)
const isPdf = fileUtils.isPdfFile(fileItem)

// 获取预览 URL
const previewUrl = fileUtils.getFilePreview(fileItem)

// 获取文件扩展名
const extension = fileUtils.getFileExtension(filename)
```

## Vue 组件中的完整示例

```vue
<template>
  <div>
    <!-- 文件上传区域 -->
    <el-upload
      class="upload-demo"
      drag
      action="#"
      multiple
      :auto-upload="false"
      :show-file-list="false"
      :limit="6"
      accept="image/*,.pdf,.doc,.docx"
      :on-change="handleFileChange"
      :on-exceed="onExceed"
    >
      <div class="upload-area">
        <el-icon><Plus /></el-icon>
        <div>点击上传</div>
      </div>
    </el-upload>

    <!-- 文件列表 -->
    <div v-if="fileList.length > 0" class="file-list">
      <div v-for="(fileItem, index) in fileList" :key="index" class="file-item">
        <!-- 图片预览 -->
        <img
          v-if="fileUtils.isImageFile(fileItem)"
          :src="fileUtils.getFilePreview(fileItem)"
          :alt="fileItem.name"
          class="file-preview"
        />
        <!-- 文档图标 -->
        <div v-else class="file-icon">
          <el-icon><Document /></el-icon>
          <span>{{ fileUtils.getFileExtension(fileItem.name) }}</span>
        </div>
        
        <!-- 删除按钮 -->
        <el-button @click="removeFile(index)" type="danger" size="small" circle>
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { createFileUploader, fileUtils, type FileItem } from '@/utils/src/upload'
import { getOssBusinessId } from '@/api'

// 文件状态管理
const fileList = ref<FileItem[]>([])

// 创建上传器
const fileUploader = createFileUploader({
  getBusinessId: getOssBusinessId,
  maxFileSize: 5,
  maxFileCount: 6,
  acceptTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']
})

// 文件选择处理
const handleFileChange = async (file: any, fileListParam: any[]) => {
  if (!file.raw) return
  
  try {
    const result = await fileUploader.uploadFiles([file.raw], fileList.value)
    fileList.value = result.files
  } catch (error) {
    console.error('文件上传失败:', error)
  }
}

// 文件数量超限处理
const onExceed = () => {
  ElMessage.warning('最多只能上传6个文件')
}

// 移除文件
const removeFile = (index: number) => {
  fileList.value = fileUploader.removeFile(fileList.value, index)
}
</script>
```

## 配置选项

```typescript
interface UploadConfig {
  uploadUrl?: string           // 上传接口地址，默认：'/system-center/resource/oss/uploadByBusinessId'
  headers?: Record<string, any> // 请求头，默认包含 Authorization
  maxFileSize?: number         // 文件大小限制（MB），默认：5
  maxFileCount?: number        // 文件数量限制，默认：6
  acceptTypes?: string[]       // 允许的文件类型，默认：['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']
  getBusinessId?: () => Promise<any> // 获取业务ID的函数，必须提供
}
```

## API 文档

### FileUploader 类

#### 方法

- `uploadFiles(files: File[] | FileList, existingFiles?: FileItem[]): Promise<UploadResult>`
  - 批量上传文件
  - 返回上传结果，包含成功的文件列表和错误信息

- `removeFile(files: FileItem[], index: number): FileItem[]`
  - 移除指定索引的文件
  - 自动处理内存释放

- `clearFiles(files: FileItem[]): void`
  - 清空所有文件
  - 自动处理内存释放

### fileUtils 工具函数

- `isImageFile(fileItem: FileItem): boolean` - 判断是否为图片文件
- `isPdfFile(fileItem: FileItem): boolean` - 判断是否为 PDF 文件
- `getFilePreview(fileItem: FileItem): string` - 获取文件预览 URL
- `getFileExtension(filename: string): string` - 获取文件扩展名

### 接口定义

```typescript
interface FileItem {
  name: string
  url: string
  ossId?: string | number
  file?: File
}

interface UploadResult {
  success: boolean
  files: FileItem[]
  errors: string[]
}
```

## 注意事项

1. 必须提供 `getBusinessId` 函数来获取上传所需的业务 ID
2. 上传器会自动处理文件验证，无需额外验证
3. 组件会自动显示上传进度和错误提示
4. 图片文件会自动生成预览 URL
5. 移除文件时会自动释放内存，避免内存泄漏 