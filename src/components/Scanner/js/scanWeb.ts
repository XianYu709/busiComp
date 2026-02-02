import { onUnmounted, reactive, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { WebScanController } from "./WebScanController.ts";
import { SOCKET_CONNECTED, SOCKET_DISCONNECTED, SOCKET_EVENT } from "./ScanEvent.ts";
import { batchSendImages, getDictsRes, examwSendImages } from "../api/scan.ts";
import { CTwainController } from "./CTwainController.ts";

let isUnmounting = false; // 新增：控制是否正在卸载
let reconnectTimer: any = null; // 新增：重连定时器引用
export const skipBlankPages = ref(false); // 是否跳过空白页 先注释
// 类型定义
interface ImageInfo {
    path: string;
    base64: string;
    thumbnail: string;
}

interface GlobalConfig {
    file_save_path: string;
    file_name_prefix: string;
    file_name_mode: string;
    image_format: string;
    image_jpeg_quality: number;
    image_tiff_compression: string;
    image_tiff_jpeg_quality: number;
}
interface uploadImage {
    remote_file_path: string;
    upload_mode: string;
    http_host: string;
    http_port: number;
    http_path: string;
    ftp_user: string;
    ftp_password: string;
    ftp_host: string;
    ftp_port: number;
}

// 扫描状态
export const scanningState = reactive({
    isScanning: false,
    scannedImages: 0,
    uploadedImages: 0,
    totalImages: 0,
    progress: 0,
    // 空白页
    blankPages: 0,
    backSideBlankPages: 0,
    nonBlankPages: 0,
});

// WebSocket连接状态
export const wsConnectionState = reactive({
    connected: false,
    connecting: false,
    error: false,
    errorMessage: "",
});

// 在 scanWeb.ts 中添加一个全局的加载状态控制
export const isLoading = ref(false);

//当前扫描模式  normal:正常往后添加  insert:在指定位置前后插入  cover:从指定位置开始往后覆盖或者添加
const scanMode = ref("normal");
//顺序扫描 当前需要插入的位置
const curInsertIndex = ref(-1);
export const isClose = ref(false);
export const msg = ref("");
// 新增一个变量控制是否已经弹过扫描错误提示
const hasShownScanError = ref(false);

//打开的设备
export const deviceName = ref<string>("");

//纸张大小
export const paperSize_value = ref("");
export const paperSize_list = ref<string[]>([]);

//选择的年级、班级
const gradeSelected = ref("");
const classSelected = ref("");
export const classType = ref("");
export const classId = ref("");
// 完整的班级对象数据
export const classData = ref<any>(null);
//学年
const academicYear = ref("");
//学科
export const subjectDefault = ref("");
// 是否多页
export const isMultiPage = ref(false);
const teacherId = ref("");
//const teacherId = localStorage.getItem('teacherId')
//本次扫描的作业名称
const name = ref("");
//批次
let batch = 1;
// 新增：扫描结束时处理单数图片的标志
let isProcessingSingleImage = false;

// 当前扫描业务类型: 'homework' | 'exam'
export const currentScanType = ref<'homework' | 'exam'>('homework');
export const examProcessId = ref("");
export const examInfoId = ref("");
export const paperGenMethod = ref("");
export const layout = ref(1);
export const periodId = ref("") // 学段



export const manualScannedBlobs = ref<Blob[]>([]);
let blobList = ref<Array<Blob>>([]);
let wsId = ""; //'ws_'+Date.now()+Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
export const recordId = ref();
// 上传队列，用于串行处理图片上传请求
let uploadQueue = Promise.resolve();

const urls = ref<ImageInfo[]>([
]);
const licence = ref("gE/rN4vZATMg49y/OCFlZA==");
const serverIP = ref("127.0.0.1");
const serverPort = ref("38999");
//const debugMode = ref(false)
//const fullscreenLoading = ref(false)

// 设备相关
export const devices = ref<string[]>([]);
const currDevice = ref("");
export const deviceOpened = ref(false);
const deviceInited = ref(false);
const isScanning = ref(false);


const scanParamsRange = ref<any[]>([]);

// 全局配置
const globalConfig = reactive<GlobalConfig>({
    file_save_path: "C:\\",
    file_name_prefix: "Doc",
    file_name_mode: "folder_time_img_order",
    image_format: "jpg",
    image_jpeg_quality: 80,
    image_tiff_compression: "lzw",
    image_tiff_jpeg_quality: 80,
});

// WebScanController 实例
export let webScanController: any = null;
export let ctwainController: CTwainController | null = null;
export const currentScannerType = ref<'HUAGO' | 'CTWAIN'>('HUAGO'); // 默认华高

onUnmounted(() => {
    onCloseScreen(deviceName.value);
});

export const initBWebSocket = (): void => {
    isUnmounting = false;
    // 防止重复初始化
    if (wsConnectionState.connected || wsConnectionState.connecting) {
        return;
    }

    wsConnectionState.connecting = true;
    wsConnectionState.error = false;

    // 【新增】初始化前，先清理可能存在的旧实例
    if (webScanController) {
        try {
            // 假设 WebScanController 有清理回调的方法，防止旧实例触发 onclose
            webScanController.onclose = null;
            if (webScanController.disconnect) webScanController.disconnect();
        } catch (e) { }
        webScanController = null;
    }

    webScanController = new WebScanController({
        wsUrl: `ws://${serverIP.value}:${serverPort.value}/`,
        wslicence: licence.value,
    });

    webScanController.initSocketIo(onSocketCallBack);
};


export const initCTwainSocket = (): void => {
    isUnmounting = false;
    // 防止重复初始化
    if (wsConnectionState.connected || wsConnectionState.connecting) return;

    wsConnectionState.connecting = true;
    wsConnectionState.error = false;
    currentScannerType.value = 'CTWAIN';

    // 清理其他scanner控制器
    if (webScanController) {
        try {
            webScanController.onclose = null;
            if (webScanController.disconnect) webScanController.disconnect();
        } catch (e) { }
        webScanController = null;
    }

    if (ctwainController) {
        ctwainController.disconnect();
        ctwainController = null;
    }

    ctwainController = new CTwainController(); // 默认 localhost:38999
    ctwainController.initSocket(onSocketCallBackCTwain);
};

//是否创建ws链接
const isCreateWebSocket = ref(false);
watch(
    () => isCreateWebSocket.value,
    (newVal: boolean) => {
        if (newVal) {
            initWebSocket();
        }
    },
);
// 后端服务基础地址（根据实际部署修改）
const baseUrl = (import.meta as any).env.VITE_APP_BASE_API;
// const baseUrl = "http://192.168.1.100:18084"; // 示例：http://ip:端口
// WebSocket连接路径（与后端@ServerEndpoint注解匹配）
const wsPath = "/learning-center/ws/server";
// 获取sid的接口地址（需后端提供，参考WebSocketController）
// WebSocket实例
let websocket: any = null;
// 心跳定时器
let heartBeatTimer: any = null;

/**
 * 初始化WebSocket连接
 */

function initWebSocket() {
    //连接ws
    if (isUnmounting) return; // 如果页面卸载了，就不连了
    connectWebSocket();
}
//存放要传递的文件
const imgList = ref<Blob[]>([]);

/**
 * 将待发送的 Blob 队列按批次发送到服务端
 * - 依赖 wsId 已经获取成功
 * - 每批次发送 2 张图片，避免出现 undefined 传入 FormData 的情况
 */
const flushBlobQueue = () => {
    if (!wsId) {
        // 还没有拿到 webSocketId，先缓存图片，等 sid 返回后再发
        return;
    }
    console.log("flushBlobQueue, blobList.length:", blobList.value.length);
    // 确保成对发送，避免将 undefined 当成文件传给 FormData
    // 每次从队列头部拿 2 个 Blob 组成一个批次
    while (blobList.value.length >= 2) {
        const first = blobList.value[0] as Blob;
        const second = blobList.value[1] as Blob;
        // 兜底校验，确保都是 Blob 类型
        if (!(first instanceof Blob) || !(second instanceof Blob)) {
            console.error("blobList 中存在非 Blob 数据，跳过本次发送", first, second);
            // 防止死循环，丢弃当前这两个异常数据
            blobList.value.splice(0, 2);
            continue;
        }
        // 在发送前确定批次号，确保每2张图片使用不同的批次号
        const currentBatch = batch;
        batch++; // 立即自增，为下一批次做准备
        // 从队列中移除已发送的两个 Blob
        blobList.value.splice(0, 2);
        // 发送当前批次，调整顺序：因为扫描仪输出顺序为[背面, 正面]，而后端需要[正面, 背面]
        // 原序：[first(背面), second(正面)] -> 调整后：[second(正面), first(背面)]
        const blobs = [second as Blob, first as Blob];
        // 将请求添加到队列中，确保串行执行
        uploadQueue = uploadQueue.then(async () => {
            await sendData(currentBatch, blobs);
        }).catch(err => {
            console.error(`批次 ${currentBatch} 队列执行出错`, err);
        });
    }
    // 新增：扫描结束时如果有单数图片，单独发送
    if (!scanningState.isScanning && blobList.value.length === 1 && wsId) {
        processSingleImage();
    }
};

/**
 * 处理单数图片（新增函数）
 */
const processSingleImage = () => {
    if (isProcessingSingleImage) return; // 防止重复处理
    if (blobList.value.length !== 1) return;
    // 检查是否有 wsId，如果没有则等待 wsId 获取成功后再发送
    if (!wsId) {
        console.log("等待 wsId 获取成功后再发送单数图片");
        return;
    }
    console.log("检测到单数图片，准备单独发送");
    const singleImage = blobList.value[0] as Blob;
    if (!(singleImage instanceof Blob)) {
        console.error("单数图片不是 Blob 类型，跳过", singleImage);
        blobList.value.splice(0, 1);
        return;
    }
    isProcessingSingleImage = true;
    // 使用当前批次号
    const currentBatch = batch;
    batch++; // 自增批次号
    // 从队列中移除已发送的图片
    blobList.value.splice(0, 1);
    // 发送单数图片
    const formData = new FormData();
    //批次
    formData.append("batch", String(currentBatch));
    //班级Id
    formData.append("classId", classId.value);
    //班级名称
    formData.append("className", classData.value?.name || "");
    //班级类型 0行政班 1教学班
    let cType = classData.value?.classType;
    if (typeof cType === 'number') {
        if (cType === 1) cType = 0;
        else if (cType === 2) cType = 1;
    }
    formData.append("classType", (cType !== null && cType !== undefined) ? String(cType) : "");
    //年级
    formData.append("grade", gradeSelected.value);
    //学段 考试从列表带过来
    formData.append("period", periodId.value);
    //学年
    const acYear = classData.value?.academicYear;
    formData.append("academicYear", (acYear !== null && acYear !== undefined) ? String(acYear) : "");
    // 是否多页
    formData.append("isMultiPage", String(isMultiPage.value));
    //学科
    formData.append("subject", subjectDefault.value);
    //设备型号
    formData.append("equipment", deviceName.value);
    //wsId - 确保这里一定有值
    formData.append("webSocketId", wsId);
    //name  作业名称
    formData.append("name", name.value);
    // 首次扫描是1 复扫是2
    formData.append("actionType", 1 as any);
    //busiId 考试的时候要传 id 也就是examProcessId这个
    let scanTypeValue = currentScanType.value === 'exam' ? 2 : 1;
    if (currentScanType.value === 'exam') {
        formData.append('busiId', examProcessId.value);
        formData.append('examInfoId', examInfoId.value);
        // 传scanType这个  9 self 10 composed 11 tripartite
        if (paperGenMethod.value === 'self') scanTypeValue = 9;
        else if (paperGenMethod.value === 'composed') scanTypeValue = 10;
        else if (paperGenMethod.value === 'tripartite') scanTypeValue = 11;
        formData.append('scanType', String(scanTypeValue)); // 扫描类型
        formData.append('layout', String(layout.value)); // 栏数
    }
    // 纸张
    formData.append("cardType", paperSize_value.value);
    //teacherId
    formData.append("teacherId", teacherId.value);
    // scanType 业务类型 作业1, 考试2
    // 单数图片，只添加一个文件
    formData.append("files", singleImage, `file-0.${globalConfig.image_format}`);
    const sendApi = currentScanType.value === 'exam' ? examwSendImages : batchSendImages;

    // 将请求添加到队列
    uploadQueue = uploadQueue.then(async () => {
        await sendApi(formData)
            .then(() => {
                console.log(`单数图片批次 ${currentBatch} 发送成功`);
                // 更新上传状态
                scanningState.uploadedImages += 1;
                isProcessingSingleImage = false;
            })
            .catch(err => {
                console.log("单数图片批次：" + currentBatch + "出现错误：" + err);
                isProcessingSingleImage = false;
            });
    }).catch(err => {
        console.error(`单数图片批次 ${currentBatch} 队列执行出错`, err);
        isProcessingSingleImage = false;
    });
};
/**
 * 建立WebSocket连接
 */
function connectWebSocket() {
    // 1. 检查是否正在销毁，如果是，直接退出
    if (isUnmounting) return;
    // 2. 清除可能存在的重连定时器，防止多重定时器并发
    if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
    }
    // 3. 检查当前连接状态
    if (websocket) {
        // 如果已经连接或正在连接，直接返回，避免重复创建
        if (websocket.readyState === WebSocket.OPEN || websocket.readyState === WebSocket.CONNECTING) {
            console.log("WebSocket 已经连接或正在连接中，跳过本次请求");
            return;
        }
        // 4. 【关键步骤】如果有残留的 socket，先清理
        // 重要：在手动 close 之前，把 onclose 设为 null，防止触发下面的重连逻辑！
        try {
            websocket.onclose = null; // <--- 防止触发死循环的核心
            websocket.onerror = null;
            websocket.onmessage = null;
            websocket.close();
        } catch (e) {
            // 忽略关闭错误
        }
        websocket = null;
    }
    const apiHost = baseUrl.replace("http://", "").replace("https://", "");
    const isHttps = window.location.protocol === "https:";
    const protocol = isHttps ? "wss" : "ws";
    const wsUrl2 = `${protocol}://${window.location.host}${apiHost}${wsPath}`;
    // const wsUrl2 = `${protocol}://${apiHost}${wsPath}`;
    console.log("准备连接服务端 WebSocket:", wsUrl2);
    try {
        websocket = new WebSocket(wsUrl2);
        websocket.onopen = function () {
            console.log("服务端 WebSocket连接成功！");
            // 连接成功后，再次确保清除重连定时器
            if (reconnectTimer) {
                clearTimeout(reconnectTimer);
                reconnectTimer = null;
            }
            startHeartBeat();
        };
        websocket.onmessage = function (event: any) {
            const message = event.data;
            handleServerMessage(message);
        };
        // 监听关闭
        websocket.onclose = function (event: any) {
            console.log("服务端 WebSocket连接关闭，代码：" + event.code);
            stopHeartBeat();
            // 只有非正常关闭(非1000) 且 页面未卸载 时才重连
            if (event.code !== 1000 && !isUnmounting) {
                console.log("连接异常断开，5秒后尝试重连服务端...");
                // 确保不会重复创建定时器
                if (reconnectTimer) clearTimeout(reconnectTimer);
                reconnectTimer = setTimeout(() => {
                    // 再次检查状态，防止5秒后页面已经切走了
                    if (!isUnmounting) {
                        connectWebSocket(); // 直接调用 connectWebSocket 即可，initWebSocket 只是个包装
                    }
                }, 5000);
            }
        };
        websocket.onerror = function (_error: any) {
            console.error("服务端 WebSocket发生错误");
            // onerror 之后通常会触发 onclose，所以重连逻辑统一写在 onclose 里
        };
    } catch (e) {
        console.error("创建 WebSocket 对象失败", e);
    }
}

/**
 * 处理服务端发送的消息
 */
function handleServerMessage(message: any) {
    // 解析JSON格式消息（后端用JSON.toJSONString()发送）
    try {
        const data = JSON.parse(message);
        // sid 获取成功
        if (data.sessionId && data.message == "服务端连接成功!sid获取成功") {
            wsId = data.sessionId;
            console.log("blobList.length:", blobList.value.length);
            // sid 获取成功后尝试发送已缓存的图片
            flushBlobQueue();
        }
        // 新增：获取到 wsId 后，检查是否有单数图片需要发送
        if (blobList.value.length === 1 && !scanningState.isScanning) {
            console.log("获取到 wsId，检查是否有单数图片需要发送");
            // 延迟一下确保 flushBlobQueue 先执行
            setTimeout(() => {
                if (blobList.value.length === 1) {
                    processSingleImage();
                }
            }, 100);
        }
        // recordId
        if (data.recordId) {
            recordId.value = data.recordId;
            sendMessageToServer("recok"); // 如果收到recordId 就给后端传个值recok
            eleMessage("扫描成功")
        }
        // 处理直接包含message字段的消息
        if (data.message && data.message.message) {
            isClose.value = true;
            msg.value = data.message.message;
            // 显示错误提示
            // showErrorMessage(data.message.message);
            showErrorMessage("扫描错误")
        }
        // 处理字符串格式的message
        if (data.message && typeof data.message === 'string') {
            // 如果是"ok"，不提示
            if (data.message === "ok") {
                console.log("收到心跳响应");
                hasShownScanError.value = false;
                return;
            }
            try {
                // 尝试解析嵌套的JSON消息
                const nestedMessage = JSON.parse(data.message);
                // 如果解析成功且有message字段，则显示提示
                if (nestedMessage.message) {
                    isClose.value = true;
                    msg.value = nestedMessage.message;
                    // 显示错误提示
                    // showErrorMessage(nestedMessage.message); // 错误信息提示
                    showErrorMessage("扫描错误")
                }
                // 处理批次错误信息
                if (nestedMessage.batch && nestedMessage.msg) {
                    // showErrorMessage(`批次 ${nestedMessage.batch}: ${nestedMessage.msg}`); // 错误信息提示
                    showErrorMessage("扫描错误")
                }
                // 处理isClose信息
                if (nestedMessage.isClose === true && nestedMessage.msg) {
                    isClose.value = true;
                    msg.value = nestedMessage.msg;
                    // showErrorMessage(nestedMessage.msg); 
                    showErrorMessage("扫描错误")
                }
            } catch (e) {
                // 如果解析失败，检查是否是特定错误消息
                const msgStr = data.message;
                if (msgStr.includes('系统关键参数出现异常') ||
                    msgStr.includes('请联系管理员') ||
                    msgStr.includes('失败') ||
                    msgStr.includes('异常')) {
                    isClose.value = true;
                    msg.value = msgStr;
                    // showErrorMessage(msgStr); // 错误信息提示
                    showErrorMessage("扫描错误")
                }
            }
        }
        // 处理isClose为true的情况
        if (data.isClose == true) {
            isClose.value = data.message.isClose;
            msg.value = data.message.msg;
            // 显示错误提示
            // showErrorMessage(data.message.msg); // 错误信息提示
            showErrorMessage("扫描错误")
        }
        // 处理连接结果
        if (data === "SUCCESS") {
            console.log("服务端验证通过，连接已建立");
        } else if (data === "INVALID_SID") {
            console.error("服务端验证失败：无效的sid");
            showErrorMessage("服务端验证失败：无效的sid"); // 错误信息提示
            // 重新获取sid并连接
            if (reconnectTimer) clearTimeout(reconnectTimer);
            reconnectTimer = setTimeout(() => {
                initWebSocket();
            }, 1000);
        } else if (data === WebSocketConstant.SERVER_HEART_BEAT) {
            console.log("收到服务端心跳响应");
        } else {
            // 处理业务消息（根据实际业务逻辑扩展）
            console.log("收到业务消息：", data);
        }
    } catch (e) {
        console.error("解析服务端消息失败：", e);
    }
}

/**
 * 显示错误消息提示
 */
function showErrorMessage(message: string): void {
    if (!message) return;
    // 根据错误内容决定提示类型
    let type: "error" | "warning" | "info" = "error";
    if (message.includes('系统关键参数出现异常') || message.includes('请联系管理员')) {
        type = "error";
    } else if (message.includes('失败') || message.includes('异常')) {
        type = "warning";
    } else {
        type = "info";
    }
    // 使用Element Plus的ElMessage组件显示提示
    ElMessage({
        message: message,
        type: type,
        duration: type === 'error' ? 60000 : 3000, // 错误消息显示时间长一些
        showClose: true,
        grouping: true, // 合并相同消息
        onClose: () => {
            // 可选：关闭后的回调
            console.log('错误提示已关闭');
        }
    });
    // 同时在控制台输出便于调试
    console.error('WebSocket返回错误:', message);
}

/**
 * 启动心跳（定期发送心跳包）
 */
function startHeartBeat() {
    // 每30秒发送一次心跳（与后端CLIENT_HEART_BEAT常量匹配）
    heartBeatTimer = setInterval(() => {
        if (websocket && websocket.readyState === WebSocket.OPEN) {
            const heartBeatMsg = "ping"; // 需与后端WebSocketConstant.CLIENT_HEART_BEAT一致
            websocket.send(heartBeatMsg);
            console.log("发送心跳包：", heartBeatMsg);
        }
    }, 30000);
}

/**
 * 停止心跳
 */
function stopHeartBeat() {
    if (heartBeatTimer) {
        clearInterval(heartBeatTimer);
        heartBeatTimer = null;
    }
}

/**
 * 主动发送消息给服务端（示例方法）
 * @param {string} content 消息内容
 */
function sendMessageToServer(content: any) {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(content);
        console.log("发送消息到服务端：", content);
    } else {
        console.error("WebSocket未连接，无法发送消息");
    }
}

// 定义常量（需与后端WebSocketConstant保持一致）
const WebSocketConstant = {
    CLIENT_HEART_BEAT: "ping", // 客户端心跳标识
    SERVER_HEART_BEAT: "ok", // 服务端心跳标识
};

//学年
const getYearData = () => {
    getDictsRes("sys_academic_year")
        .then(res => {
            if ((res as any).code === 200 && res.data && res.data.length > 0) {
                academicYear.value = res.data[0].dictLabel;
            }
        })
        .catch(err => {
            console.warn("学年数据获取失败", err);
        });
};
const sendData = (batchNumber?: number, blobsToSend?: Blob[]) => {
    return new Promise((resolve) => {
        const currentBlobs = blobsToSend || imgList.value;
        console.log(blobList.value.length, "----发送----", currentBlobs.length);
        // 使用传入的批次号，如果没有传入则使用当前的 batch（向后兼容）
        const currentBatch = batchNumber !== undefined ? batchNumber : batch;
        const formData = new FormData();
        //批次
        formData.append("batch", String(currentBatch));
        //班级Id
        formData.append("classId", classId.value);
        //班级名称
        formData.append("className", classData.value?.name || "");
        //班级类型 0行政班 1教学班
        let cType = classData.value?.classType;
        if (typeof cType === 'number') {
            if (cType === 1) cType = 0;
            else if (cType === 2) cType = 1;
        }
        formData.append("classType", (cType !== null && cType !== undefined) ? String(cType) : "");
        //年级
        formData.append("grade", gradeSelected.value);
        //formData.append('grade',gradeSelected.value)
        //学段
        formData.append("period", periodId.value || "");
        //学年
        const acYear = classData.value?.academicYear;
        formData.append("academicYear", (acYear !== null && acYear !== undefined) ? String(acYear) : "");
        // 是否多页
        formData.append("isMultiPage", String(isMultiPage.value));
        //学科
        formData.append("subject", subjectDefault.value);
        //设备型号
        formData.append("equipment", deviceName.value);
        //wsId
        formData.append("webSocketId", wsId);
        //name  作业名称
        formData.append("name", name.value);
        // 首次扫描是1 复扫是2
        formData.append("actionType", 1 as any);
        //busiId 考试的时候要传 id 也就是examProcessId这个
        let scanTypeValue = currentScanType.value === 'exam' ? 2 : 1;
        if (currentScanType.value === 'exam') {
            formData.append('busiId', examProcessId.value);
            formData.append('examInfoId', examInfoId.value);
            if (paperGenMethod.value === 'self') scanTypeValue = 9;
            else if (paperGenMethod.value === 'composed') scanTypeValue = 10;
            else if (paperGenMethod.value === 'tripartite') scanTypeValue = 11;
            formData.append('scanType', String(scanTypeValue)); // 扫描类型
            formData.append('layout', String(layout.value)); // 栏数
        }
        //teacherId
        formData.append("teacherId", teacherId.value);
        // 纸张
        formData.append("cardType", paperSize_value.value);
        //scanType 业务类型 作业1, 考试2
        formData.append("scanType", String(scanTypeValue));
        currentBlobs.forEach((blob, index) => {
            // 使用相同的参数名"files"，后端才能解析为MultipartFile[]
            formData.append("files", blob, `file-${index}.${globalConfig.image_format}`);
        });
        const sendApi = currentScanType.value === 'exam' ? examwSendImages : batchSendImages;
        sendApi(formData)
            .then(r => {
                console.log(`批次 ${currentBatch} 发送成功 (${currentScanType.value})`);
                // 更新上传状态
                scanningState.uploadedImages += currentBlobs.length;
                //根据返回的正常、异常数量在页面展示，
                resolve(r);
            })
            .catch(err => {
                console.log("批次：" + currentBatch + "出现错误：" + err);
                // 即使失败也resolve，保证队列继续执行
                resolve(null);
            });
        //}
    });
};

// 空白页检测 (暂不使用，注释以消除 unused 警告)
/*
const isVisuallyBlank = async (base64Str: string): Promise<boolean> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 50;
            canvas.height = 50;
            const ctx = canvas.getContext('2d');
            if (!ctx) { resolve(false); return; }
            ctx.drawImage(img, 0, 0, 50, 50);
            const data = ctx.getImageData(0, 0, 50, 50).data;
            let darkPixels = 0;
            for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                if (avg < 230) darkPixels++;
            }
            console.log(`[PixelCheck] Dark Pixels: ${darkPixels} / 2500`);
            resolve(darkPixels < 20);
        };
        img.onerror = () => resolve(false);
        img.src = base64Str;
    });
};
*/

let scanQueue = Promise.resolve();
const addToScanQueue = (task: () => Promise<void>) => {
    scanQueue = scanQueue.then(task).catch(err => console.error("Scan Queue Error:", err));
};

const onSocketCallBack = (info: any): void => {
    switch (info.code) {
        case SOCKET_CONNECTED:
            wsConnectionState.connected = true;
            wsConnectionState.connecting = false;
            wsConnectionState.error = false;
            initData();
            console.log("socket connected");
            break;
        case SOCKET_DISCONNECTED:
            wsConnectionState.connected = false;
            wsConnectionState.connecting = false;
            wsConnectionState.error = true;
            wsConnectionState.errorMessage = "WebSocket连接断开";
            console.log("socket disconnect !!!");
            // 如果正在扫描中连接断开，需要重置状态，防止Loading一直显示
            if (scanningState.isScanning || isScanning.value) {
                isClose.value = true;
                scanningState.isScanning = false;
                isScanning.value = false;
                msg.value = "WebSocket连接断开";
            }
            // 自动重连/Fallback 逻辑: 如果 Huagao 连接失败，尝试连接 CTwain
            // 只有在非卸载状态下尝试，并且只有在异常关闭时尝试
            if (!isUnmounting) {
                // 判断是否为正常关闭 (通常 info 里没有 code??, WebScanController 统一传了 SOCKET_DISCONNECTED)
                // 从 info.data 获取 CloseEvent
                const closeEvent = info.data || {};
                if (closeEvent.code !== 1000) {
                    console.log("Huagao disconnected, fallback to CTwain in 1s...");
                    setTimeout(() => {
                        if (!isUnmounting && !wsConnectionState.connected) {
                            initCTwainSocket();
                        }
                    }, 1000);
                }
            }
            break;
        case SOCKET_EVENT:
            const parsedInfo = JSON.parse(info.data);
            dispatchEvent(parsedInfo);
            if (parsedInfo.func) {
                if (parsedInfo.func === "scan_image") {
                    addToScanQueue(async () => {
                        // const isBlankFlag = !!parsedInfo.is_blank;
                        // const base64Length = parsedInfo.image_base64 ? parsedInfo.image_base64.length : 0;
                        // console.log("Full Scan Info:", JSON.stringify(parsedInfo));
                        // let isActuallyBlank = false;
                        // 2026-01-21: 暂时注释掉空白页过滤逻辑。
                        // 这里原本包含了基于文件大小(base64Length < 50000)和像素检测(isVisuallyBlank)的空白页判定。
                        // 按照需求仅注释不删除，以便后续恢复或参考。
                        // if (isBlankFlag) {
                        //     // Tier 1: 极小文件直接跳过 (Safe threshold < 50KB)
                        //     if (base64Length < 50000) {
                        //         isActuallyBlank = true;
                        //         console.log(`Ignored truly blank image (Small Size: ${base64Length})`);
                        //     } else {
                        //         // Tier 2: 大小模糊区间 (50KB+)，进行像素检测
                        //         // 解决部分 A3 空白页(288KB) 大于 内容页(184KB) 的问题
                        //         console.log(`Ambiguous blank page (${base64Length}). Verifying pixels...`);
                        //         if (parsedInfo.image_base64) {
                        //             isActuallyBlank = await isVisuallyBlank(parsedInfo.image_base64);
                        //             if (isActuallyBlank) console.log("Ignored truly blank image (Pixel Verified)");
                        //             else console.log("Pixel check passed: Image has content.");
                        //         } else {
                        //             isActuallyBlank = true; // No content -> Blank
                        //         }
                        //     }
                        // }
                        /*
                        const isBlankFlag = false;
                        const base64Length = data.length;
                        // 简单阈值：全白或全黑图片压缩后通常很小，或者像素方差很小
                        const isActuallyBlank = isBlankFlag;
                        */
                        // if (isActuallyBlank) {
                        //     // 确实是空白页
                        //     scanningState.blankPages++;
                        //     scanningState.totalImages++;
                        //     // 判断是否是背面（简单逻辑：偶数页可能是背面）
                        //     const pageNumber = scanningState.blankPages + scanningState.nonBlankPages;
                        //     const isBackSide = (pageNumber % 2 === 0);
                        //     if (isBackSide) {
                        //         scanningState.backSideBlankPages++;
                        //         console.log(`第${pageNumber}页是背面空白页，已跳过`);
                        //         // 如果背面是空白被跳过，且队列中正好有前面那张正面图，则触发单数图片发送逻辑
                        //         if (blobList.value.length === 1) {
                        //             processSingleImage();
                        //         }
                        //     } else {
                        //         console.log(`第${pageNumber}页是正面空白页，已跳过`);
                        //     }
                        //     return;
                        // }
                        // 非空白页，正常处理
                        // console.log(parsedInfo.image_path);
                        const blob = dataURLtoBlob(parsedInfo.image_base64);
                        blobList.value.push(blob);
                        // 更新非空白页计数
                        scanningState.nonBlankPages++;
                        // 更新扫描状态
                        scanningState.scannedImages = blobList.value.length;
                        scanningState.totalImages = scanningState.scannedImages;
                        isCreateWebSocket.value = true;
                        // console.log("socket received scan_image");
                        // 每收到一张图片，若已经拿到 wsId，则尝试按批次发送
                        flushBlobQueue();
                    });
                } else if (parsedInfo.func === "scan_end") {
                    addToScanQueue(async () => {
                        // 扫描结束，更新所有相关状态
                        scanningState.isScanning = false;
                        scanningState.progress = 100;
                        isScanning.value = false; // 确保这个状态也被更新
                        // 扫描结束时检查是否有剩余的单数图片
                        if (blobList.value.length === 1) {
                            console.log("扫描结束，检测到剩余单数图片，准备发送");
                            processSingleImage();
                        }
                        // 设置关闭标志和消息
                        isClose.value = true;
                        msg.value = "扫描完成";
                        console.log("扫描完成，保持WebSocket连接"); // 扫描完成 才能关闭页面上的遮罩层
                    });
                } else if (parsedInfo.func === "scan_begin") {
                    scanningState.isScanning = true;
                    scanningState.scannedImages = 0;
                    scanningState.uploadedImages = 0;
                    scanningState.totalImages = 0;
                    scanningState.progress = 0;
                    isScanning.value = true;
                    // 重置空白页统计
                    scanningState.blankPages = 0;
                    scanningState.backSideBlankPages = 0;
                    scanningState.nonBlankPages = 0;
                    // 重置批次号
                    batch = 1;
                    isProcessingSingleImage = false;
                }
            }
            break;
    }
};

const dispatchEvent = (info: any): void => {
    if (info.func) {
        if (info.func === "is_device_init" || info.func === "get_curr_device_name") {
            const funcName = webScanController.getCallBack(info.func);
            if (funcName) {
                funcName(info);
            }
        } else {
            if (info.ret != null && info.ret !== undefined) {
                if (info.ret === 0) {
                    const funcName = webScanController.getCallBack(info.func);
                    if (funcName) {
                        funcName(info);
                    } else {
                        commonDispatch(info);
                    }
                } else {
                    const errMsg = info.err_info ? info.err_info : "未知异常";
                    if (errMsg.indexOf("已初始化") !== -1 || errMsg.indexOf("Already initialized") !== -1 || info.func === "set_device_param") {
                        console.log(`忽略 ${info.func} 错误:`, errMsg);
                    } else {
                        // eleMessage(errMsg, "error");
                        eleMessage('扫描错误', "error");
                        // 发生错误时，确保关闭loading状态，避免页面一直在加载中
                        isClose.value = true;
                        msg.value = errMsg;
                        scanningState.isScanning = false;
                        isScanning.value = false;
                    }

                }
            } else {
                commonDispatch(info);
            }
        }
    }
};

const commonDispatch = (info: any): void => {
    if (info) {
        switch (info.func) {
            case "device_arrive":
                // eleMessage("设备已装载");
                break;
            case "device_remove":
                eleMessage("设备已移除！");
                deinitDevices();
                deviceOpened.value = false;
                deviceInited.value = false;
                devices.value = [];
                currDevice.value = "";
                break;
            case "scan_begin":
                isScanning.value = true;
                scanningState.isScanning = true;
                // eleMessage("开始扫描");
                break;
            case "scan_end":
                isScanning.value = false;
                scanningState.isScanning = false;
                isClose.value = true; // 添加这行
                msg.value = "扫描完成"; // 添加这行
                // eleMessage("扫描结束");
                break;
        }
    }
};

// 初始化数据
const initData = (): void => {
    getGlobalConfig();
    openDeviceSetting();
};

// 切换松下设备时切换服务  deviceName：要改成的设备名称
export const onCloseScreen = (deviceName: string): void => {
    if (deviceName.slice(0, 9) === "HUAGOSCAN") {
        //关闭松下服务
        //启动华高服务
        initWebSocket();
    } else if (deviceName === "CTWAIN") {
        initCTwainSocket();
    } else {
        //关闭华高的服务
        releaseService();
        //启动
    }
};
export const cleanupWebSocket = () => {
    // 1. 设置标志位，阻止所有后续的重连尝试
    isUnmounting = true;
    // 2. 停止心跳
    stopHeartBeat();
    // 3. 清除重连定时器
    if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
    }
    // 4. 关闭 服务端 WebSocket
    if (websocket) {
        // 关键：设为 null 防止触发 onclose 里的重连
        websocket.onclose = null;
        websocket.onerror = null;
        websocket.onmessage = null;
        websocket.close();
        websocket = null;
    }
    // 5. 关闭 扫描仪 WebSocket (WebScanController)
    if (webScanController) {
        // 假设 WebScanController 实例上有 onclose 方法，将其置空
        webScanController.onclose = null;
        if (webScanController.disconnect) {
            webScanController.disconnect();
        }
        webScanController = null;
    }
    if (ctwainController) {
        if (ctwainController.disconnect) ctwainController.disconnect();
        ctwainController = null;
    }
    // 6. 重置其他状态s
    wsConnectionState.connected = false;
    wsConnectionState.connecting = false;
};

const releaseService = (): void => {
    deinitDevices();
    if (webScanController) {
        webScanController.disconnect();
    }
};

/*******************************************扫描仪控制***************************************************************/
// 获取全局参数
const getGlobalConfig = (): void => {
    if (currentScannerType.value === 'CTWAIN' || !webScanController) return;
    webScanController.getGlobalConfig((info: GlobalConfig) => {
        Object.assign(globalConfig, info);
    });
};

// 设置全局参数
export const setGlobalConfig = (userConfig: GlobalConfig): void => {
    if (currentScannerType.value === 'CTWAIN' || !webScanController) {
        console.log("CTwain 模式下跳过 setGlobalConfig");
        return;
    }
    Object.assign(globalConfig, userConfig);
    webScanController.setGlobalConfig(globalConfig, (_info: any) => {
        // eleMessage("设置全局配置成功");
    });
};

// 初始化设备
export const initDevice = (succcallBack?: () => void): void => {
    if (currentScannerType.value === 'CTWAIN') {
        // CTwain 模式下，设备初始化通常在连接时完成
        if (deviceInited.value) succcallBack?.();
        return;
    }
    if (!webScanController) return;

    webScanController.isDeviceInit((info: any) => {
        if (info.ret === 0) {
            deviceInited.value = true;
            succcallBack?.();
        } else {
            webScanController.initDevice((_info: any) => {
                deviceInited.value = true;
                succcallBack?.();
            });
        }
    });
};

// 反初始化设备
const deinitDevices = (): void => {
    if (currentScannerType.value === 'CTWAIN') return;
    if (!deviceInited.value || !webScanController) return;

    webScanController.deinitDevices((_info: any) => {
        deviceInited.value = false;
        deviceOpened.value = false;
    });
};

// 获取设备列表
export const getDeviceList = (): void => {
    if (currentScannerType.value === 'CTWAIN') {
        if (ctwainController) {
            ctwainController.getScanList((_res: any) => {
            });
        }
        return;
    }

    if (!webScanController) return;

    webScanController.getDeviceNameList((info: any) => {
        if (info.device_name_list) {
            devices.value = info.device_name_list;
            if (devices.value.length === 0 && currentScannerType.value === 'HUAGO') {
                console.log("Huagao connected but no devices found. Switching to CTwain...");
                // Clean up Huagao connection
                if (webScanController) {
                    webScanController.onclose = null;
                    if (webScanController.disconnect) webScanController.disconnect();
                }
                // Start CTwain
                initCTwainSocket();
            }
        }
    });
};


// 打开设备
export const openDevice = (name: string): void => {
    // eleMessage("正在打开设备：" + name);
    // userConfig unused
    // const userConfig = {
    //     license: "",
    //     device_name: name,
    // };

    if (currentScannerType.value === 'CTWAIN') {
        const defaultSizes = ["A4", "A3", "16K", "B5"];
        paperSize_list.value = defaultSizes;
        paperSize_value.value = "A4";
        if (ctwainController) {
            const index = devices.value.indexOf(name);
            if (index !== -1) {
                ctwainController.connectToScan(index, name, (res: any) => {
                    if ((res && res.data && res.data.code === 200) || (res && res.status === 'success')) {
                        deviceOpened.value = true;
                        getScanParams();
                    }
                });
            }
        }
        return;
    }
    if (!webScanController) return;
    webScanController.getCurrDeviceName((info: any) => {
        if (info.device_name) {
            deviceOpened.value = true;
            //eleLoadding()
            getScanParams();
        } else {
            webScanController.openDevice(name, (info: any) => {
                deviceOpened.value = true;
                //eleLoadding()
                getScanParams();
            });
        }
    });
};

// 关闭设备
export const closeDevice = (): void => {
    if (currentScannerType.value === 'CTWAIN') {
        // CTwain close logic if needed
        if (ctwainController) {
            ctwainController.closeDevice((_info: any) => {
                deviceOpened.value = false;
            });
        }
        return;
    }
    if (!deviceOpened.value) return;
    if (webScanController) {
        webScanController.closeDevice((_info: any) => {
            deviceOpened.value = false;
        });
    } else {
        deviceOpened.value = false;
    }
};

// 设置扫描参数
export const setScanParams = (param: any): void => {
    if (currentScannerType.value === 'CTWAIN' || !webScanController) {
        console.log("CTwain 模式下跳过 setScanParams (参数在 startScan 中传递)");
        return;
    }
    webScanController.setScanParams(param, (_info: any) => {
        // eleMessage("设置扫描参数成功");
    });
};

// 获取扫描参数
const getScanParams = (): void => {
    console.log("getScanParams called, type:", currentScannerType.value);
    if (currentScannerType.value === 'CTWAIN') {
        // CTwain 默认提供常见纸张大小，避免"无数据"
        const defaultSizes = ["A4", "A3", "16K", "B5"];
        paperSize_list.value = defaultSizes;
        paperSize_value.value = "A4";
        console.log("Initialized CTwain default paper sizes:", defaultSizes);
        if (ctwainController) {
            ctwainController.getScanParams((res: any) => {
                console.log("CTwain getScanParams res:", res);
                // 尝试从 API 读取真实参数 (如果支持)
                if (res && res.data) {
                    if (res.data.paperSizeList && Array.isArray(res.data.paperSizeList)) {
                        paperSize_list.value = res.data.paperSizeList;
                    }
                    if (res.data.paperSize) {
                        paperSize_value.value = res.data.paperSize;
                    }
                }
            });
        }
    } else {
        if (!webScanController) return;
        webScanController.getScanParams((info: any) => {
            scanParamsRange.value = info.device_param;
            //下标15个是纸张大小信息
            if (scanParamsRange.value && scanParamsRange.value[0] && scanParamsRange.value[0].group_param && scanParamsRange.value[0].group_param[15]) {
                paperSize_value.value = scanParamsRange.value[0].group_param[15].value;
                paperSize_list.value = scanParamsRange.value[0].group_param[15].value_list;
            }
        });
    }
};


// 设备改变事件
export const onDeviceChanged = (deviceName: string): void => {
    localStorage.setItem('last_scanner_name', deviceName);
    closeDevice();
    openDevice(deviceName);
};

// 打开设备设置
export const openDeviceSetting = async (): void => {
    //console.log('准备打开设置',deviceInited.value)
    if (deviceInited.value) {
        // 设置界面显示逻辑
    } else {
        initDevice(() => {
            getDeviceList();
            //}, 500)
        });
    }
    //console.log(devices.value)
};

// 开始扫描
//gradeOptions:选择的年级，classOptions:选择的班级,，subjectDefault:学科，name:作业名称，teacherId
export const startScan = (
    gradeOptions: string,
    classid: string,
    classOptions: string,
    subject: string,
    nameOp: string,
    Id: string,
    classDataObj?: any, // 完整的班级对象数据（可选参数）
    scanTypeOp: 'homework' | 'exam' = 'homework',
    examProcessIdOp: string = "", // 考试ID
    periodIdOp: string = "", // 学段ID
    examInfoIdOp: string = "", // 考试信息ID
    paperGenMethodOp: string = "", // 答题卡类型
    layoutOp: number = 1, // 栏数
    paperSizeOp: string = "", // 纸张大小
    isMultiPageOp: boolean = false, // 是否多页
): void => {
    currentScanType.value = scanTypeOp;
    gradeSelected.value = gradeOptions;
    classId.value = classid;
    classSelected.value = classOptions;
    subjectDefault.value = subject;
    name.value = nameOp;
    teacherId.value = Id;
    isMultiPage.value = isMultiPageOp;
    if (paperSizeOp) paperSize_value.value = paperSizeOp;
    examProcessId.value = examProcessIdOp;
    periodId.value = periodIdOp;
    paperGenMethod.value = paperGenMethodOp;
    examInfoId.value = examInfoIdOp;
    layout.value = layoutOp;
    if (!classDataObj || !classDataObj.academicYear) {
        getYearData();
    }
    // 默认设置为跳过空白页
    skipBlankPages.value = true;
    // console.log(`启用默认跳过空白页配置`);
    // 如果传入了完整的班级对象，则更新
    if (classDataObj) {
        classData.value = classDataObj;
        // 同时更新相关字段
        if (classDataObj.academicYear) {
            academicYear.value = classDataObj.academicYear;
        }
    }
    if (isScanning.value) {
        eleMessage("请先等待扫描结束！", "warning");
        return;
    }
    scanMode.value = "normal";
    curInsertIndex.value = urls.value.length;
    // 清空之前的图片列表
    blobList.value = [];
    // 重置单数图片处理标志
    isProcessingSingleImage = false;
    // 默认使用空白页检测扫描
    if (currentScannerType.value === 'HUAGO') {
        webScanController.startScanSkipBlankPages((info: any) => {
            if (info.ret === 0) {
                // HUAGO logic remains
            } else {
                // eleMessage("开始扫描失败：" + info.err_info, "error");
            }
        });
    } else if (currentScannerType.value === 'CTWAIN') {
        if (ctwainController) {
            ctwainController.curExamId = examInfoIdOp;
            ctwainController.curSubjectId = subject;
            console.log("正在发送 CTwain 扫描指令...");
            // === 定义强制开始扫描的逻辑 ===
            const handleScanStartSuccess = () => {
                if (isScanning.value) return;
                console.log("✅ 强制触发扫描开始状态 (Mock)");
                const fakeBeginMsg = { func: 'scan_begin' };
                dispatchEvent(fakeBeginMsg);
                eleMessage("扫描指令已发送");
            };

            const scanTimeout = setTimeout(() => {
                console.warn("⚠️ StartScan 响应超时，强制执行扫描逻辑...");
                handleScanStartSuccess();
            }, 1000);

            ctwainController.startScan({
                device: deviceName.value,
                paperSize: paperSizeOp || paperSize_value.value || 'A4',
                get_base64: true,
                return_base64: true,
            }, (res: any) => {
                clearTimeout(scanTimeout);
                console.log("收到 START_SCAN 真实响应:", res);
                if (res && res.status === 'success') {
                    handleScanStartSuccess();
                } else if (res && res.data && res.data.code === 200) {
                    // Legacy fallback
                }
            });
        }
    }
};
export const initWebSocketJY = (): void => {
    webScanController = new WebScanController({
        wsUrl: `ws://${serverIP.value}:${serverPort.value}/`,
        wslicence: licence.value,
    });
    webScanController.initSocketIo(onSocketCallBackJY);
    webScanController.onclose = function (event: any) {
        console.log("WebSocket连接关闭，代码：" + event.code + "，原因：" + event.reason);
        ElMessageBox.confirm("连接扫描仪失败", "Warning", {
            confirmButtonText: "OK",
            //cancelButtonText: 'Cancel',
            type: "warning",
        })
            .then(() => {
                ElMessage({
                    type: "success",
                    message: "Delete completed",
                });
            })
            .catch(() => {
                ElMessage({
                    type: "info",
                    message: "Delete canceled",
                });
            });

        // 自动重连（5秒后重试）
        setTimeout(initBWebSocket, 5000);
    };
};
export const jyImgList = ref([]);
const onSocketCallBackJY = (info: any): void => {
    switch (info.code) {
        case SOCKET_CONNECTED:
            initData();
            console.log("socket connected");
            break;
        case SOCKET_DISCONNECTED:
            console.log("socket disconnect !!!");
            break;
        case SOCKET_EVENT:
            const parsedInfo = JSON.parse(info.data);
            dispatchEvent(parsedInfo);
            if (parsedInfo.func) {
                if (parsedInfo.func === "scan_image") {
                    console.log("Full Scan Info:", JSON.stringify(parsedInfo));
                    const isBlankFlag = !!parsedInfo.is_blank;
                    const base64Length = parsedInfo.image_base64 ? parsedInfo.image_base64.length : 0;
                    if (isBlankFlag && base64Length < 145000) {
                        console.log("Ignored truly blank image, size:", base64Length);
                        return;
                    }
                    if (isBlankFlag && base64Length >= 145000) {
                        console.log("Image flagged as blank but has significant content, size:", base64Length);
                    }
                    console.log(parsedInfo.image_path);
                    jyImgList.value.push(parsedInfo.image_path);
                    if (parsedInfo.image_base64) {
                        const blob = dataURLtoBlob(parsedInfo.image_base64);
                        manualScannedBlobs.value.push(blob);
                    }
                    console.log("socket received scan_image  image_path:" + parsedInfo.image_path);
                } else if (parsedInfo.func === "insert_local_image") {
                    console.log("socket received insert_local_image");
                } else if (parsedInfo.func === "modify_image") {
                    console.log("socket received modify_image");
                } else if (parsedInfo.func === "scan_end") {
                    console.log("socket received scan_end (JY)");
                    isClose.value = true;
                    msg.value = "扫描完成";
                    scanningState.isScanning = false;
                } else {
                    console.log("socket received: " + info.data);
                }
            }
            break;
    }
};
export const jyStartScan = (_paper) => {
    getScanParams();
    webScanController.startScanSkipBlankPages((info: any) => {
        if (info.ret === 0) {
            eleMessage("开始扫描", "success");
        } else {
            // eleMessage("开始扫描失败：" + info.err_info, "error");
        }
    });
};

watch(() => deviceOpened.value, (val) => {
    console.log("👀 deviceOpened 状态变更为:", val);
    if (val) {
        ElMessage.success("设备状态已更新为：就绪");
    } else {
        console.warn("设备状态被重置为：未就绪");
    }
});
/*******************************************图像处理相关***************************************************************/

// 将base64转换为blob
export const dataURLtoBlob = (dataUrl: any) => {
    var data;
    if (dataUrl.indexOf(",") != -1) {
        data = dataUrl.split(",")[1];
    } else {
        data = dataUrl;
    }
    var bstr = atob(data);
    var n = bstr.length;
    var u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr]);
};

const eleMessage = (
    msg: string,
    type: "success" | "warning" | "info" | "error" = "success",
): void => {
    if (type === 'error') {
        ElMessage({
            message: msg,
            type: type,
            duration: 60000,
            showClose: true,
        });
    } else {
        ElMessage({
            message: msg,
            duration: 5000,
            type: type,
        });
    }
};


export const uploadImage = () => {
    //console.log("要上传了----")
    webScanController.uploadImage(
        0,
        "http",
        "/images/1.jpg",
        "172.20.218.165",
        18088,
        "/res/questionInfo/uploadWordA",
        "administrator",
        "2018",
        "192.168.0.22",
        21,
        function (info: any) {
            console.log("上传完成：" + JSON.stringify(info));
        },
    );
};

const onSocketCallBackCTwain = (info: any): void => {
    switch (info.code) {
        case SOCKET_CONNECTED:
            wsConnectionState.connected = true;
            wsConnectionState.connecting = false;
            wsConnectionState.error = false;
            console.log("CTwain connected");
            if (ctwainController) {
                // 延迟 500ms 后获取设备列表
                setTimeout(() => {
                    console.log("准备获取设备列表...");
                    ctwainController?.getScanList((res: any) => {
                        console.log("GET_DEVICES 响应:", res);
                        const listData = res.devices || res.data?.data || res.data;

                        if (listData && Array.isArray(listData)) {
                            devices.value = listData.map((d: any) => typeof d === 'string' ? d : d.scanName);

                            if (listData.length > 0) {
                                // 智能设备选择策略
                                let targetDeviceName = String(devices.value[0]);
                                const lastUsedName = localStorage.getItem('last_scanner_name');

                                if (lastUsedName && devices.value.includes(lastUsedName)) {
                                    targetDeviceName = lastUsedName;
                                    console.log(`🎯 命中上次使用的设备: ${targetDeviceName}`);
                                } else if (deviceName.value && devices.value.includes(deviceName.value)) {
                                    targetDeviceName = deviceName.value;
                                    console.log(`🎯 保持当前选中设备: ${targetDeviceName}`);
                                }

                                console.log(`准备连接设备: ${targetDeviceName}`);

                                // 1. 定义连接成功的处理逻辑
                                const handleConnectSuccess = () => {
                                    if (deviceOpened.value) return;
                                    console.log("执行连接成功逻辑 (UI状态更新)");
                                    deviceOpened.value = true;
                                    deviceInited.value = true;
                                    deviceName.value = targetDeviceName;
                                    localStorage.setItem('last_scanner_name', targetDeviceName);

                                    eleMessage(`已连接 CTwain 设备: ${targetDeviceName}`);
                                    getScanParams();
                                };

                                // 2. 设置超时
                                const connectTimeout = setTimeout(() => {
                                    console.warn("ConnectToScan 响应超时，强制认定为成功...");
                                    handleConnectSuccess();
                                }, 3000); // 增加超时时间以防万一

                                // 3. 发送连接指令 (New Protocol: scanIndex is irrelevant, pass 0)
                                ctwainController?.connectToScan(0, targetDeviceName, (connRes: any) => {
                                    console.log("收到 CONNECT_SCANNER 真实响应:", connRes);
                                    clearTimeout(connectTimeout);

                                    if (connRes?.status === 'error') {
                                        eleMessage(`无法连接到设备 ${targetDeviceName}: ${connRes.message || '未知错误'}`, "error");
                                    } else if (connRes?.status === 'success' || (connRes?.data && connRes.data.code === 200)) {
                                        handleConnectSuccess();
                                    } else {
                                        console.warn("连接响应未知，尝试认定为成功(Legacy)...", connRes);
                                        handleConnectSuccess();
                                    }
                                });
                            } else {
                                console.warn("设备列表为空");
                                eleMessage("未检测到扫描仪", "warning");
                            }
                        }
                    });
                }, 1000); // 延时1秒
            }
            break;
        case SOCKET_DISCONNECTED:
            wsConnectionState.connected = false;
            wsConnectionState.connecting = false; // Ensure this stops "Connecting..." status
            wsConnectionState.error = true;
            wsConnectionState.errorMessage = "CTwain Disconnected";
            break;
        case SOCKET_EVENT:
            const data = JSON.parse(info.data);
            handleCTwainEvent(data);
            break;
    }
}

const handleCTwainEvent = (data: any) => {
    console.log('CTwain Event:', data);

    // 优先处理 Action 协议
    if (data.action) {
        switch (data.action) {
            case 'SCAN_STARTED':
                isScanning.value = true;
                scanningState.isScanning = true;
                scanningState.scannedImages = 0;
                isCreateWebSocket.value = true; // 确保业务socket连接
                eleMessage("开始扫描...");
                break;

            case 'SCAN_IMAGE':
                console.log("Full Scan Info (CTwain):", JSON.stringify(data));
                if (data.status === 'success') {
                    // 1. 优先检查分开的 frontImageBase64 / backImageBase64 (New Scanner)
                    const b64Front = data.frontImageBase64;
                    const b64Back = data.backImageBase64;

                    if (b64Front || b64Back) {
                        console.log("Received Single/Dual Base64 Images (Direct Field)!");

                        // flushBlobQueue 期望队列里是 [背面, 正面]，然后它会交换成 [正面, 背面] 发送
                        // 所以这里我们必须按 [背面, 正面] 的顺序 push

                        if (b64Back) {
                            console.log("Pushing Back Image (Base64)");
                            blobList.value.push(dataURLtoBlob(b64Back));
                        }
                        if (b64Front) {
                            console.log("Pushing Front Image (Base64)");
                            blobList.value.push(dataURLtoBlob(b64Front));
                        }

                        scanningState.scannedImages = blobList.value.length;
                        isCreateWebSocket.value = true;
                        flushBlobQueue();
                        return;
                    }

                    // 2. 检查单张 base64 (Legacy / Single)
                    const directBase64 = data.base64 || data.image || data.data || data.image_base64;
                    if (directBase64) {
                        console.log("Received Direct Base64 Image (Fast Path)!");
                        const blob = dataURLtoBlob(directBase64);
                        blobList.value.push(blob);
                        scanningState.scannedImages = blobList.value.length;
                        isCreateWebSocket.value = true;
                        flushBlobQueue();
                        return;
                    }

                    // 3. 如果只有路径，则需要根据路径拉取 (Slow Path)
                    const paths: string[] = [];
                    // 为了保持一致性，如果走路径拉取，也应该尽量保持 [背面, 正面] 的顺序入队
                    // 但由于 fetch 是异步的，顺序很难严格保证，除非串行 await。
                    // 现有逻辑是 forEach + callback，谁先回谁先进。
                    // 暂时保持原逻辑，或者改为 Back 先 push
                    if (data.back) paths.push(data.back);   // 先 Back
                    if (data.front) paths.push(data.front); // 后 Front

                    if (paths.length === 0 && data.path) {
                        paths.push(data.path);
                    }
                    const uniquePaths = [...new Set(paths)];

                    const handleImageSuccess = (blob: Blob) => {
                        console.log("Image Acquired Successfully");
                        blobList.value.push(blob);
                        scanningState.scannedImages = blobList.value.length;
                        isCreateWebSocket.value = true;
                        flushBlobQueue();
                    };

                    uniquePaths.forEach((path) => {
                        console.log("收到扫描图片路径 (Socket Fetch):", path);
                        if (ctwainController) {
                            ctwainController.loadLocalImage(String(path), (res: any) => {
                                if (res && (res.base64 || res.data)) {
                                    const b64 = res.base64 || res.data;
                                    handleImageSuccess(dataURLtoBlob(b64));
                                } else {
                                    // 容错
                                    if (res && res.status === 'success' && !res.base64) {
                                        console.warn("Socket reported success but no base64 content.");
                                    } else {
                                        eleMessage(`读取图片失败: ${path}`, "error");
                                    }
                                }
                            });
                        } else {
                            eleMessage(`读取图片失败(控制器未连接): ${path}`, "error");
                        }
                    });
                }
                break;

            case 'SCAN_COMPLETED':
                // 延迟一点结束，确保最后的图片请求有机会发出
                setTimeout(() => {
                    finishScan();
                }, 500);
                break;

            case 'SCAN_ERROR':
            case 'Error':
                eleMessage(data.message || "扫描仪错误", "error");
                scanningState.isScanning = false;
                break;
        }
        return;
    }

    // 兼容旧协议 (Legacy)
    switch (data.type) {
        case 'ScanComplete':
            if (data.data && data.data.success) {
                eleMessage("扫描完成");
                // 如果有 filePath，尝试加载图片
                if (data.data.filePath && ctwainController) {
                    console.log("尝试加载扫描图片:", data.data.filePath);
                    ctwainController.loadLocalImage(data.data.filePath, (res: any) => {
                        if (res && res.data && res.data.base64) {
                            const blob = dataURLtoBlob(res.data.base64);
                            blobList.value.push(blob);
                            scanningState.scannedImages = blobList.value.length;
                            flushBlobQueue();
                        } else {
                            console.warn("无法获取图片内容，仅显示路径", data.data.filePath);
                        }
                        finishScan();
                    });
                } else {
                    finishScan();
                }
            }
            break;
        case 'StartScanSuccess':
            isScanning.value = true;
            scanningState.isScanning = true;
            eleMessage("开始扫描...");
            break;
        case 'ScanCount':
            if (data.count !== undefined) {
                scanningState.scannedImages = data.count;
            }
            break;
        case 'Error':
            eleMessage("扫描仪错误", "error");
            scanningState.isScanning = false;
            break;
    }
}

const finishScan = () => {
    isScanning.value = false;
    scanningState.isScanning = false;
    isClose.value = true;
    msg.value = "扫描完成";
    // 如果有单张剩余，尝试处理
    if (blobList.value.length === 1) {
        processSingleImage();
    }
}

