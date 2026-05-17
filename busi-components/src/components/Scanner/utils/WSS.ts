// 后端服务基础地址（根据实际部署修改）
const baseUrl = 'http://192.168.28.180:18084'; // 示例：http://ip:端口
// WebSocket连接路径（与后端@ServerEndpoint注解匹配）
const wsPath = '/learning-center/ws/server/';
// 获取sid的接口地址（需后端提供，参考WebSocketController）
const getSidUrl = baseUrl + '/learning-center/ws/get-sid';
// WebSocket实例
let websocket:any = null;
// 服务端生成的sid
let sid:any = null;
// 心跳定时器
let heartBeatTimer:any = null;

// 初始化：先获取sid，再建立连接
//initWebSocket();

/**
 * 初始化WebSocket连接
 */
export function initWebSocket() {
    // 1. 第一步：获取服务端生成的sid
    fetch(getSidUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('获取sid失败，HTTP状态码：' + response.status);
            }
            return response.text(); // 解析sid（服务端返回纯文本格式的sid）
        })
        .then(serverSid => {
            sid = serverSid;
            console.log('成功获取sid：', sid);

            // 2. 第二步：建立WebSocket连接
            connectWebSocket();


        })
        .catch(error => {
            console.error('初始化WebSocket失败：', error);
            // 失败重试（5秒后重试）
            setTimeout(initWebSocket, 5000);
        });
}

/**
 * 建立WebSocket连接
 */
function connectWebSocket() {
    // 拼接完整的WebSocket连接地址
    // 格式：ws://ip:端口/ws/server/[sid]
    const wsUrl = 'ws://' + baseUrl.replace('http://', '') + wsPath + sid;
    console.log('开始连接WebSocket：', wsUrl);

    // 创建WebSocket实例
    websocket = new WebSocket(wsUrl);

    // 3. 第三步：处理连接事件

    // 连接成功回调
    websocket.onopen = function() {
        console.log('WebSocket连接成功！');
        // 连接成功后启动心跳（每30秒发送一次）
        startHeartBeat();
    };

    // 接收服务端消息回调
    websocket.onmessage = function(event:any) {
        const message = event.data;
        console.log('收到服务端消息：', message);

        // 处理服务端响应
        handleServerMessage(message);
    };

    // 连接关闭回调
    websocket.onclose = function(event:any) {
        console.log('WebSocket连接关闭，代码：' + event.code + '，原因：' + event.reason);
        // 关闭心跳定时器
        stopHeartBeat();
        // 自动重连（5秒后重试）
        setTimeout(initWebSocket, 5000);
    };

    // 连接错误回调
    websocket.onerror = function(error:any) {
        console.error('WebSocket发生错误：', error);
        // 错误时关闭连接，触发重连
        if (websocket) {
            websocket.close();
        }
    };
}

/**
 * 处理服务端发送的消息
 */
function handleServerMessage(message:any) {
    // 解析JSON格式消息（后端用JSON.toJSONString()发送）
    try {
        const data = JSON.parse(message);

        // 处理连接结果
        if (data === 'SUCCESS') {
            console.log('服务端验证通过，连接已建立');
        } else if (data === 'INVALID_SID') {
            console.error('服务端验证失败：无效的sid');
            // 重新获取sid并连接
            initWebSocket();
        } else if (data === WebSocketConstant.SERVER_HEART_BEAT) {
            console.log('收到服务端心跳响应');
        } else {
            // 处理业务消息（根据实际业务逻辑扩展）
            console.log('收到业务消息：', data);
            // 例如：更新页面UI、触发其他操作等
        }
    } catch (e) {
        console.error('解析服务端消息失败：', e);
    }
}

/**
 * 启动心跳（定期发送心跳包）
 */
function startHeartBeat() {
    // 每30秒发送一次心跳（与后端CLIENT_HEART_BEAT常量匹配）
    heartBeatTimer = setInterval(() => {
        if (websocket && websocket.readyState === WebSocket.OPEN) {
            const heartBeatMsg = 'CLIENT_HEART_BEAT'; // 需与后端WebSocketConstant.CLIENT_HEART_BEAT一致
            websocket.send(heartBeatMsg);
            console.log('发送心跳包：', heartBeatMsg);
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
export function sendMessageToServer(content:any) {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(content);
        console.log('发送消息到服务端：', content);
    } else {
        console.error('WebSocket未连接，无法发送消息');
    }
}

// 定义常量（需与后端WebSocketConstant保持一致）
const WebSocketConstant = {
    CLIENT_HEART_BEAT: 'ping', // 客户端心跳标识
    SERVER_HEART_BEAT: 'ok'  // 服务端心跳标识
};