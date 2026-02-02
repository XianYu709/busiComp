import axiosUtils from "../utils/AxiosUtils";
//import request from '@/utils/request'
import request from "../../../../../packages/ai-edu-web-front/src/utils/request.ts";
import type { AxiosPromise } from "axios";
import { type DictDataVO } from "./types";
import type { UserInfo } from "../../../../../packages/ai-edu-web-front/apps/core/api/user/types.ts";
const clientId = import.meta.env.VITE_APP_CLIENT_ID;
//提交作业扫描的图片列表
export function homework(list: any) {
  return request({
    url: "/learning-center/homework/scanRecord/imgStorage",
    method: "post",
    list,
  });
  //return axiosUtils.post('/api/learning-center/homework/scanRecord/imgStorage',list)
}
//提交考试扫描的图片列表
export function exam(list: any) {
  return request({
    url: "/learning-center/homework/scanRecord/imgStorage",
    method: "post",
    list,
  });
  //return axiosUtils.post('/api/learning-center/homework/scanRecord/imgStorage',list)
}

export function getSid() {
  return request({
    url: "/learning-center/ws/get-sid",
    method: "get",
    clientId: clientId,
  });
}
export function uploadFire(param: any) {
  return axiosUtils.post("/res/questionInfo/uploadWordA", param);
}

// 作业
export const batchSendImages = (formData: FormData) => {
  return request({
    url: "/learning-center/homework/scanRecord/homeworkWsScan",
    method: "post",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// 考试
export const examwSendImages = (formData: FormData) => {
  return request({
    url: "/learning-center/exam/scanRecord/examWsScan",
    method: "post",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
// 学号重复 - 作业
export function getscanRecord(scanRecordId: string): AxiosPromise<DictDataVO[]> {
  return request({
    url: "/learning-center/homework/scanRecord/homeworkWsScanRepeat/" + scanRecordId,
    method: "post",
  });
}

// 学号重复 - 考试
export function examWsScanRepeat(scanRecordId: string) {
  return request({
    url: `/learning-center/exam/scanRecord/examWsScanRepeat/${scanRecordId}`,
    method: "post",
  });
}

// 考试扫描后统计数量
export function getExamScanStatistics(params: any) {
  return request({
    url: "/learning-center/exam/scanRecord/statistics",
    method: "get",
    params: params,
  });
}

// 考试扫描后获取统计列表
export function getExamScanList(params: any) {
  return request({
    url: "/learning-center/exam/scanRecord/list",
    method: "get",
    params: params,
  });
}

// 考试获取扫描记录
export function getScanRecordExam(busiId: string) {
  return request({
    url: `/learning-center/exam/scanRecord/getScanRecord/${busiId}`,
    method: "get",
  });
}


//根据教师id获取班级
export const queryClassByTeacherId = (params: any) => {
  // GET请求使用params传参，和getPaperCatalogueList类似
  const requestParams: any = {
    teacherId: String(params.teacherId),
  };

  return request({
    url: "/resource-center/res/homework/queryClassByTeacherId",
    method: "get",
    params: requestParams,
  });
};
export const getInfo = () => {
  return request({
    url: "/system-center/system/user/getInfo",
    method: "get",
  });
};
//根据教师id获取班级
// export function getClassListByTeacherId(data) {
//   return request({
//     url: "/resource-center/res/homework/queryClassByTeacherId",
//     method: "GET",
//     data,
//   });
// }

export function getDicts(dictType: string): AxiosPromise<DictDataVO[]> {
  return request({
    url: "/system-center/system/dict/data/type/" + dictType,
    method: "get",
  });
}
//
export function getDictsRes(dictType: string) {
  return request({
    url: "/resource-center/resourceCenter/platform/getDictDatelist?type=" + dictType,
    method: "GET",
  });
}
//考试扫描统计 (Old one? Maybe used for progress)
export function getExamProgress(params) {
  return request({
    url: "/learning-center/exam/scanProgress/statistics",
    method: "GET",
    params: params,
  });
}
//获取考生列表
export function getExamPage(params) {
  return request({
    url: "/learning-center/exam/scanProgress/examinees/page",
    method: "GET",
    params: params,
  });
}
//获取作业列表
export function getHomeworkPage(params) {
  return request({
    url: "/learning-center/homework/scanRecord/list",
    method: "GET",
    params: params,
  });
}

// 获取作业数据  
export function getStatistics(params) {
  return request({
    url: "/learning-center/homework/scanRecord/statistics",
    method: "GET",
    params: params,
  });
}

// 考试扫描进度${id}
export function getCompleteScan(id: any) {
  return request({
    url: "/exam-center/exam/process-template-inst/complete-scan/" + id,
    method: "PUT",
  });
}


/**
 * 根据权限获取班级列表
 * @param params
 * @returns
 */
export const classListAuth = (params?: {}) => {
  return request({
    url: '/generality-center/academi/class/list/auth',
    method: 'get',
    params
  })
}