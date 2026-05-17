
import { SOCKET_CONNECTED, SOCKET_DISCONNECTED, SOCKET_EVENT } from './ScanEvent.ts';

// CTwain 协议定义的类型
export interface CTwainMessage {
    action?: string;
    type?: string;
    data?: any;
    timestamp?: number;
    messageId?: string;
    senderId?: string;
    receiverId?: string;
    code?: string | number;
    message?: string;
}

// 扫描仪信息
export interface CTwainScanner {
    scanIndex: number;
    scanName: string;
    isConnected: boolean;
    scanCount?: number;
    uploadCount?: number;
}

// 扫描参数
export interface CTwainScanParams {
    dpi: string;
    color: string;
    paperSize: string;
    isDouble: boolean;
    isRawSetView: boolean;
    [key: string]: any;
}

export interface CTwainCredentials {
    isThirdCard?: boolean;
    loginAccount?: string;
    loginPwd?: string;
    [key: string]: any;
}

type CallbackFunction = (info: any) => void;

export class CTwainController {
    private wsUrl: string;
    private socket: WebSocket | null = null;
    private messageId: number = 0;
    private callbacks: Map<string, CallbackFunction> = new Map(); // messageId -> callback
    private eventListeners: Map<string, CallbackFunction[]> = new Map(); // eventType -> callbacks
    private socketCallback: ((info: any) => void) | null = null;
    private isConnected: boolean = false;
    private reconnectTimer: any = null;

    private pendingGetScanListCallback: CallbackFunction | null = null;
    private pendingConnectToScanCallback: CallbackFunction | null = null;
    private pendingReadImageCallback: CallbackFunction | null = null;

    // 当前选中的学校、考试、科目信息（用于请求头）
    public curSchoolId: string = "";
    public curExamId: string = "";
    public curSubjectId: string = "";
    // 增加 license 属性
    public license: string = "";

    constructor(options: { wsUrl?: string, wslicence?: string } = {}) {
        this.wsUrl = options.wsUrl || 'ws://127.0.0.1:33899/';
        this.license = options.wslicence || "";
    }

    public initSocket(socketCallback: (info: any) => void): void {
        this.socketCallback = socketCallback;
        this.connect();
    }

    public get connected(): boolean {
        return this.isConnected;
    }

    private connect(): void {
        try {
            this.socket = new WebSocket(this.wsUrl);

            this.socket.onopen = () => {
                console.log('CTwain WebSocket Connected');
                this.isConnected = true;
                if (this.reconnectTimer) {
                    clearTimeout(this.reconnectTimer);
                    this.reconnectTimer = null;
                }
                if (this.socketCallback) {
                    this.socketCallback({ code: SOCKET_CONNECTED, msg: "Connected" });
                }
            };

            this.socket.onmessage = (event) => {
                try {
                    const message: CTwainMessage = JSON.parse(event.data);
                    this.handleMessage(message);
                } catch (e) {
                    console.error('Failed to parse CTwain message', e);
                }
            };

            this.socket.onclose = (event) => {
                console.log('CTwain WebSocket Closed', event);
                this.isConnected = false;
                if (this.socketCallback) {
                    this.socketCallback({ code: SOCKET_DISCONNECTED, msg: "Disconnected" });
                }
                // 尝试重连
                this.reconnectTimer = setTimeout(() => {
                    console.log('CTwain Reconnecting...');
                    this.connect();
                }, 5000);
            };

            this.socket.onerror = (error) => {
                console.error('CTwain WebSocket Error', error);
            };

        } catch (e) {
            console.error('CTwain Connection Error', e);
        }
    }

    public disconnect(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.socket) {
            this.socket.onclose = null; // 防止触发重连
            this.socket.close();
            this.socket = null;
        }
        this.isConnected = false;
        this.pendingGetScanListCallback = null;
        this.pendingConnectToScanCallback = null;
        this.pendingStartScanCallback = null;
        this.pendingReadImageCallback = null;
        this.callbacks.clear();
        this.readImageQueue = [];
        this.isReadingImage = false;
    }

    private sendMessage(action: string, params: any = null, callback?: CallbackFunction): void {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.error('CTwain socket not open');
            return;
        }

        // Strict minimal payload per user request
        const payload: any = {
            action: action
        };

        if (params !== null && params !== undefined) {
            payload.params = params;
        }

        const msgId = (++this.messageId).toString();
        if (callback) {
            this.callbacks.set(msgId, callback);
        }

        this.socket.send(JSON.stringify(payload));
    }

    private handleMessage(message: any): void {
        // 【调试关键】打印收到的每一条消息，请在控制台查看这个日志！
        console.log('CTwain Incoming:', message);

        // 1. 优先处理带 messageId 的精确回调
        if (message.messageId && this.callbacks.has(message.messageId)) {
            const cb = this.callbacks.get(message.messageId);
            if (cb) {
                cb(message);
                this.callbacks.delete(message.messageId);
                return;
            }
        }

        // 2. 模糊匹配逻辑

        // --- 匹配 GET_DEVICES (获取设备列表) ---
        if (this.pendingGetScanListCallback) {
            if (message.action === 'GET_DEVICES' && Array.isArray(message.devices)) {
                this.pendingGetScanListCallback(message);
                this.pendingGetScanListCallback = null;
                return;
            }
        }

        // --- 匹配 CONNECT_SCANNER (连接设备) ---
        if (this.pendingConnectToScanCallback) {
            // 识别特征: 有 status=success 且含有 device 字段 (或者 message 包含 connected)
            if (message.status === 'success' && (message.device || (message.message && message.message.includes('connected')))) {
                console.log('✅ Matched CONNECT_SCANNER (Success)');
                this.pendingConnectToScanCallback(message);
                this.pendingConnectToScanCallback = null;
                return;
            }
            // 错误情况: {"status":"error","message":"Device not found"}
            if (message.status === 'error' && this.pendingConnectToScanCallback) {
                console.log('❌ Matched CONNECT_SCANNER (Error)');
                this.pendingConnectToScanCallback(message);
                this.pendingConnectToScanCallback = null;
                return;
            }
        }

        // --- 匹配 START_SCAN ---
        if (this.pendingStartScanCallback) {
            if (message.status === 'error') {
                console.log('❌ Matched START_SCAN (Error)');
                this.pendingStartScanCallback(message);
                this.pendingStartScanCallback = null;
                return;
            }
            if (message.action === 'SCAN_STARTED') {
                console.log('✅ Matched START_SCAN Callback');
                this.pendingStartScanCallback(message);
                this.pendingStartScanCallback = null;
                // 注意：SCAN_STARTED 只是开始，不需要 return，后续可能还有 images
            }
        }

        // --- 匹配 READ_IMAGE / LOAD_LOCAL_IMAGE (读取图片内容) ---
        if (this.pendingReadImageCallback) {
            const rawAction = message.action || message.func || message.type || '';
            const action = String(rawAction).toUpperCase();

            if (action === 'READ_IMAGE' ||
                action === 'LOAD_LOCAL_IMAGE' ||
                action === 'READIMAGE' ||
                action === 'GETIMAGE' ||
                action === 'SCAN_IMAGE' // 某些旧版本可能会以SCAN_IMAGE类型返回读取结果
            ) {
                console.log('✅ Matched READ_IMAGE/LOAD_LOCAL_IMAGE Callback (Loose)');
                this.pendingReadImageCallback(message);
                this.pendingReadImageCallback = null;
                return;
            }
        }

        // 3. 通用事件通知 (分发给 scanWeb.ts 的 onSocketCallBackCTwain)
        if (this.socketCallback) {
            this.socketCallback({
                code: SOCKET_EVENT,
                data: JSON.stringify(message)
            });
        }
    }

    public startService(callback?: CallbackFunction): void {
        this.sendMessage('StartService', { port: 33899, autoConnectDevice: true }, callback);
    }

    public getScanList(callback?: CallbackFunction): void {
        this.pendingGetScanListCallback = callback || null;
        this.sendMessage('GET_DEVICES', null, callback);
    }

    public connectToScan(_scanIndex: number, scanName: string, callback?: CallbackFunction): void {
        this.pendingConnectToScanCallback = callback || null;
        this.sendMessage('CONNECT_SCANNER', { device: scanName }, callback);
    }

    public getScanParams(callback?: CallbackFunction): void {
        this.sendMessage('GetScanParams', null, callback);
    }

    private pendingStartScanCallback: CallbackFunction | null = null;

    public startScan(params: any, callback?: CallbackFunction): void {
        this.pendingStartScanCallback = callback || null;
        this.sendMessage('START_SCAN', params, callback);
    }

    // --- 2. 状态监控方法 ---

    public getServerStatus(callback?: CallbackFunction): void {
        this.sendMessage('GetServerStatus', null, callback);
    }

    public getNetworkStatistics(callback?: CallbackFunction): void {
        this.sendMessage('GetNetworkStatistics', null, callback);
    }

    // --- 3. 设备管理方法 ---

    public getDeviceList(callback?: CallbackFunction): void {
        this.sendMessage('GetDeviceList', null, callback);
    }

    public getDeviceStatus(deviceId: string, callback?: CallbackFunction): void {
        this.sendMessage('GetDeviceStatus', { deviceId }, callback);
    }

    // --- 4. 辅助/其他 ---

    // 队列控制变量
    private readImageQueue: { path: string, callback: CallbackFunction }[] = [];
    private isReadingImage: boolean = false;

    // 尝试获取本地图片 (如果支持) - 改为队列处理
    public loadLocalImage(imagePath: string, callback?: CallbackFunction): void {
        this.readImageQueue.push({ path: imagePath, callback: callback || (() => { }) });
        this.processReadImageQueue();
    }

    private processReadImageQueue(): void {
        if (this.isReadingImage || this.readImageQueue.length === 0) return;

        const req = this.readImageQueue.shift();
        if (!req) return;

        this.isReadingImage = true;
        let isHandled = false;

        // 包装回调
        const wrappedCallback = (res: any) => {
            if (isHandled) return;
            isHandled = true;

            try {
                // 标准化返回结果
                let normalizedRes = { ...res };
                let base64Val = '';
                // 优先检查 status
                if (res.status === 'success' || res.code === 200) {
                    // 尝试提取 base64
                    if (typeof res.data === 'string') base64Val = res.data;
                    else if (typeof res.base64 === 'string') base64Val = res.base64;
                }

                // 兼容旧逻辑的强力提取
                if (!base64Val) {
                    if (typeof res.base64 === 'string') base64Val = res.base64;
                    else if (typeof res.data === 'string') base64Val = res.data;
                }

                if (base64Val) {
                    normalizedRes.base64 = base64Val;
                    normalizedRes.data = base64Val;
                }
                req.callback(normalizedRes);
            } catch (err) {
                console.error("Error in loadLocalImage callback:", err);
            }

            // 清理状态并处理下一个
            this.pendingReadImageCallback = null;
            this.isReadingImage = false;
            setTimeout(() => this.processReadImageQueue(), 50);
        };

        this.pendingReadImageCallback = wrappedCallback;

        // 路径标准化：将反斜杠转换为正斜杠
        const normalizedPath = req.path.replace(/\\/g, '/');

        // 发送扁平 Payload
        const payload = {
            func: 'read_image',   // 核心指令
            path: normalizedPath, // 图像路径
            compress: 0,          // 不压缩
            is_base64: true,      // 明确请求 base64
            iden: this.license    // 身份凭证
        };

        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            console.log("CTwain Sending (read_image flat):", payload);
            this.socket.send(JSON.stringify(payload));
        } else {
            console.warn("CTwain socket not open, skipping READ_IMAGE");
            wrappedCallback({ status: 'error', message: 'Socket not open' });
            return;
        }

        // 超时 10s
        setTimeout(() => {
            if (!isHandled) {
                console.warn("CTwain READ_IMAGE internal timeout for:", normalizedPath);
                wrappedCallback({ status: 'error', message: 'Internal Queue Timeout' });
            }
        }, 10000);
    }

    public stopScan(callback?: CallbackFunction): void {
        // 猜测 action
        this.sendMessage('STOP_SCAN', null, callback);
    }

    // 心跳
    public ping(): void {
    }

    // 监听特定事件 (如 ScanCount, ScanComplete)
    public on(type: string, callback: CallbackFunction): void {
        if (!this.eventListeners.has(type)) {
            this.eventListeners.set(type, []);
        }
        this.eventListeners.get(type)?.push(callback);
    }

    public off(type: string, callback: CallbackFunction): void {
        const listeners = this.eventListeners.get(type);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    }
    public closeDevice(callback?: CallbackFunction): void {
        if (callback) callback({ status: 'success' });
    }
}
