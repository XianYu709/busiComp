import axios from 'axios';

const request = axios.create({
    //baseURL: ' http://192.168.156.180:18084/api'
});

// 添加请求拦截器
request.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么

    return config;
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});

// 添加响应拦截器
request.interceptors.response.use(function (response) {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    return response;
}, function (error) {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    return Promise.reject(error);
});

const http = {
    get<T>(url : string, params ?: any, config ?: any) : Promise<T> {
        return new Promise((resolve, reject) => {
            request.get<T>(url, { params, ...config }).then((res) => {
                resolve(res.data);
            }).catch((error) => {
                reject(error);
            })
        })
    },
    post<T>(url : string, data ?: any, config ?: any) : Promise<T> {
        return new Promise((resolve, reject) => {
            request.post<T>(url, data, config).then((res) => {
                resolve(res.data);
            }).catch((error) => {
                reject(error);
            })
        })
    }
}

export default http;