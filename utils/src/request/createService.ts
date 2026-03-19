import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  CreateAxiosDefaults,
  InternalAxiosRequestConfig,
} from "axios";
import { blobValidate, tansParams } from "../ruoyiUtils";
import axios from "axios";
import { getToken } from "../auth";
import cache from "../cache";
import { encryptBase64, encryptWithAes, generateAesKey } from "../crypto";
import { encrypt } from "../jsencrypt";
/* 默认拦截器 */
type createServiceType<T> = {
  requestInterceptors?: (config: AxiosRequestConfig) => any;
  requestErrorInterceptors?: (error: AxiosError) => AxiosError;
  responseInterceptors?: (res: AxiosResponse<T>) => AxiosResponse<T>;
  responseErrorInterceptors?: (error: AxiosError) => AxiosError;
};
const createService = <T>(
  options: CreateAxiosDefaults,
  defaultInterceptors?: createServiceType<T>,
  encryptHeader?: string,
  ENCRYPT: boolean = false,
) => {
  encryptHeader = "encrypt-key";
  const service = axios.create(options);
  service.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (defaultInterceptors?.requestInterceptors)
        return defaultInterceptors.requestInterceptors(config);

      const isToken = config.headers?.isToken === false;
      // 是否需要防止数据重复提交
      const isRepeatSubmit = config.headers?.repeatSubmit === false;
      // 是否需要加密
      const isEncrypt = config.headers?.isEncrypt === "true";

      if (getToken() && !isToken) {
        config.headers["Authorization"] = "Bearer " + getToken(); // 让每个请求携带自定义token 请根据实际情况自行修改
      }
      // get请求映射params参数
      if (config.method === "get" && config.params) {
        let url = config.url + "?" + tansParams(config.params);
        url = url.slice(0, -1);
        config.params = {};
        config.url = url;
      }

      if (!isRepeatSubmit && (config.method === "post" || config.method === "put")) {
        const requestObj = {
          url: config.url,
          data: typeof config.data === "object" ? JSON.stringify(config.data) : config.data,
          time: new Date().getTime(),
        };
        const sessionObj = cache.session.getJSON("sessionObj");
        if (sessionObj === undefined || sessionObj === null || sessionObj === "") {
          cache.session.setJSON("sessionObj", requestObj);
        } else {
          const s_url = sessionObj.url; // 请求地址
          const s_data = sessionObj.data; // 请求数据
          const s_time = sessionObj.time; // 请求时间
          const interval = 500; // 间隔时间(ms)，小于此时间视为重复提交
          if (
            s_data === requestObj.data &&
            requestObj.time - s_time < interval &&
            s_url === requestObj.url
          ) {
            const message = "数据正在处理，请勿重复提交";
            console.warn(`[${s_url}]: ` + message);
            return Promise.reject(new Error(message));
          } else {
            cache.session.setJSON("sessionObj", requestObj);
          }
        }
      }
      if (ENCRYPT) {
        // 当开启参数加密
        if (isEncrypt && (config.method === "post" || config.method === "put")) {
          // 生成一个 AES 密钥
          const aesKey = generateAesKey();
          config.headers[encryptHeader] = encrypt(encryptBase64(aesKey));
          config.data =
            typeof config.data === "object"
              ? encryptWithAes(JSON.stringify(config.data), aesKey)
              : encryptWithAes(config.data, aesKey);
        }
      }
      // FormData数据去请求头Content-Type
      if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
      }
      return config;
    },
    (error: any) => {
      // 添加全局的请求错误处理
      return Promise.reject(error);
    },
  );
  return service;
};

export default createService;
