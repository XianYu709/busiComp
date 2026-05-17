// WebScanController.ts
import { SOCKET_CONNECTED, SOCKET_DISCONNECTED, SOCKET_EVENT } from './ScanEvent.ts'
import { openDeviceSetting } from "./scanWeb.ts";
// 常量定义
const TAG = 'WebScanController:';

// 类型定义
interface WebScanOptions {
    wsUrl: string;
    wslicence: string;
}

interface Result {
    code: string | number;
    msg: string;
    data: any;
}

interface WaterMarkInfo {
    text: string;
    text_color: string;
    text_opacity: number;
    text_pos: string;
    margin_left: number;
    margin_top: number;
    margin_right: number;
    margin_bottom: number;
    location_x: number;
    location_y: number;
    font_name: string;
    font_size: number;
    font_bold: boolean;
    font_underline: boolean;
    font_italic: boolean;
    font_strikeout: boolean;
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

interface ScanParam {
    name: string;
    value: any;
}

type CallbackFunction = (info: any) => void;

class WebScanController {
    private wsUrl: string;
    private wslicence: string;
    private SocketClient: WebSocket | null = null;
    private callBackList: Map<string, CallbackFunction> = new Map();
    private socketCallBacks?: (info: Result) => void;

    constructor(options: WebScanOptions) {
        this.wsUrl = options.wsUrl || "ws://localhost:38999";
        this.wslicence = options.wslicence;
    }

    /*****************************************扫描仪相关********************************************************************************/

    isDeviceInit(callBack: CallbackFunction): void {
        this.sendCommand({
            func: "is_device_init",
            iden: this.wslicence
        }, callBack);
    }

    initDevice(callBack: CallbackFunction): void {
        this.sendCommand({
            func: "init_device",
            iden: this.wslicence
        }, callBack);
    }

    deinitDevices(callBack: CallbackFunction): void {
        this.sendCommand({
            func: "deinit_device",
            iden: this.wslicence
        }, callBack);
    }

    getDeviceNameList(callBack: CallbackFunction): void {
        this.sendCommand({
            func: "get_device_name_list",
            iden: this.wslicence
        }, callBack);
    }

    openDevice(device_name: string, callBack: CallbackFunction): void {
        this.sendCommand({
            func: "open_device",
            iden: this.wslicence,
            device_name: device_name
        }, callBack);
    }

    closeDevice(callBack: CallbackFunction): void {
        this.sendCommand({
            func: "close_device",
            iden: this.wslicence
        }, callBack);
    }

    setScanParams(appendParams: ScanParam[], callBack: CallbackFunction): void {
        const fixedParams = {
            func: "set_device_param",
            iden: this.wslicence,
            device_param: appendParams
        };
        console.log('final set scan params:', JSON.stringify(fixedParams));
        this.sendCommand(fixedParams, callBack);
    }

    getScanParams(callBack: CallbackFunction): void {
        this.sendCommand({
            func: "get_device_param",
            iden: this.wslicence
        }, callBack);
    }

    resetScanParams(callBack: CallbackFunction): void {
        this.sendCommand({
            func: "reset_device_param",
            iden: this.wslicence
        }, callBack);
    }

    getCurrDeviceName(callBack: CallbackFunction): void {
        this.sendCommand({
            func: "get_curr_device_name",
            iden: this.wslicence
        }, callBack);
    }

    /**
     * 原始开始扫描方法（默认不启用空白页检测）
     * @param callBack 回调函数
     */
    startScan(callBack: CallbackFunction): void {
        this.sendCommand({
            func: "start_scan",
            iden: this.wslicence,
            get_base64: true
        }, callBack);
    }

    /**
     * 开始扫描并启用空白页检测
     * @param blankCheck 是否启用空白页检测（默认启用）
     * @param localSave 是否保存到本地
     * @param getBase64 是否获取base64
     * @param callBack 回调函数
     */
    startScanWithBlankCheck(
        blankCheck: boolean = true,
        localSave: boolean = true,
        getBase64: boolean = false,
        callBack: CallbackFunction
    ): void {
        this.sendCommand({
            func: "start_scan",
            iden: this.wslicence,
            blank_check: blankCheck, // 关键参数：启用空白页检测
            auto_del_blank: blankCheck, // 尝试兼容其他命名
            remove_blank: blankCheck, // 尝试兼容其他命名
            local_save: localSave,
            get_base64: getBase64
        }, callBack);
    }

    /**
     * 开始扫描并跳过空白页（包括背面空白）- 推荐使用
     * @param callBack 回调函数
     */
    startScanSkipBlankPages(callBack: CallbackFunction): void {
        this.startScanWithBlankCheck(true, true, true, callBack);
    }

    stopScan(callBack: CallbackFunction): void {
        this.sendCommand({
            func: "stop_scan",
            iden: this.wslicence
        }, callBack);
    }

    /*****************************************基本接口********************************************************************************/

    saveLocalPic(base64: string, callBack: CallbackFunction): void {
        const cmd = {
            func: "save_local_image",
            iden: this.wslicence,
            image_base64: base64
        };
        console.log(TAG, 'saveLocalPic', cmd);
        this.sendCommand(cmd, callBack);
    }

    getGlobalConfig(callBack: CallbackFunction): void {
        this.sendCommand({
            func: "get_global_config",
            iden: this.wslicence
        }, callBack);
    }

    setGlobalConfig(appendParams: GlobalConfig, callBack: CallbackFunction): void {
        const fixedParams = {
            func: "set_global_config",
            iden: this.wslicence
        };
        const finalParams = { ...appendParams, ...fixedParams };
        console.log('final set global params:', JSON.stringify(finalParams));
        this.sendCommand(finalParams, callBack);
    }

    loadLocalImage(imagePath: string, callBack: CallbackFunction): void {
        this.sendCommand({
            func: "load_local_image",
            iden: this.wslicence,
            image_path: imagePath
        }, callBack);
    }

    saveLocalImage(imageBase64: string, callBack: CallbackFunction): void {
        this.sendCommand({
            func: "save_local_image",
            iden: this.wslicence,
            image_base64: imageBase64
        }, callBack);
    }

    deleteLocalFile(filePath: string, callBack: CallbackFunction): void {
        this.sendCommand({
            func: "delete_local_file",
            iden: this.wslicence,
            file_path: filePath
        }, callBack);
    }

    clearGlobalFileSavePath(callBack: CallbackFunction): void {
        this.sendCommand({
            func: "clear_global_file_save_path",
            iden: this.wslicence
        }, callBack);
    }

    mergeLocalImage(
        imagePathList: string[],
        mode: string,
        align: string,
        getBase64: boolean,
        callBack: CallbackFunction
    ): void {
        this.sendCommand({
            func: "merge_local_image",
            iden: this.wslicence,
            image_path_list: imagePathList,
            mode: mode,
            align: align,
            interval: 0,
            get_base64: getBase64
        }, callBack);
    }

    localMakeMultiImage(
        imagePathList: string[],
        format: string,
        tiffCompression: string,
        tiffJpegQuality: number,
        callBack: CallbackFunction
    ): void {
        this.sendCommand({
            func: "local_make_multi_image",
            iden: this.wslicence,
            image_path_list: imagePathList,
            format: format,
            tiff_compression: tiffCompression,
            tiff_jpeg_quality: tiffJpegQuality
        }, callBack);
    }

    splitLocalImage(
        imagePath: string,
        mode: string,
        location: number,
        callBack: CallbackFunction
    ): void {
        this.sendCommand({
            func: "split_local_image",
            iden: this.wslicence,
            image_path: imagePath,
            mode: mode,
            location: location,
            local_save: true,
            get_base64: false
        }, callBack);
    }

    localMakeZipFile(imagePathList: string[], callBack: CallbackFunction): void {
        this.sendCommand({
            func: "local_make_zip_file",
            iden: this.wslicence,
            file_path_list: imagePathList
        }, callBack);
    }

    localImageDeskew(imagePath: string, callBack: CallbackFunction): void {
        this.sendCommand({
            func: "local_image_deskew",
            iden: this.wslicence,
            image_path: imagePath
        }, callBack);
    }

    uploadLocalFile(
        filePath: string,
        uploadMode: string,
        remoteFilePath: string,
        httpHost: string,
        httpPort: number,
        httpPath: string,
        ftpUser: string,
        ftpPassword: string,
        ftpHost: string,
        ftpPort: number,
        callBack: CallbackFunction
    ): void {
        this.sendCommand({
            func: "upload_local_file",
            iden: this.wslicence,
            file_path: filePath,
            upload_mode: uploadMode,
            remote_file_path: remoteFilePath,
            http_host: httpHost,
            http_port: httpPort,
            http_path: httpPath,
            ftp_user: ftpUser,
            ftp_password: ftpPassword,
            ftp_host: ftpHost,
            ftp_port: ftpPort
        }, callBack);
    }

    localImageAddWatermark(
        imagePath: string,
        text: string,
        textColor: string,
        textOpacity: number,
        textPos: string,
        marginLeft: number,
        marginTop: number,
        marginRight: number,
        marginBottom: number,
        locationX: number,
        locationY: number,
        fontName: string,
        fontSize: number,
        fontBold: boolean,
        fontUnderline: boolean,
        fontItalic: boolean,
        fontStrikeout: boolean,
        getBase64: boolean,
        callBack: CallbackFunction
    ): void {
        this.sendCommand({
            func: "local_image_add_watermark",
            iden: this.wslicence,
            image_path: imagePath,
            text: text,
            text_color: textColor,
            text_opacity: textOpacity,
            text_pos: textPos,
            margin_left: marginLeft,
            margin_top: marginTop,
            margin_right: marginRight,
            margin_bottom: marginBottom,
            location_x: locationX,
            location_y: locationY,
            font_name: fontName,
            font_size: fontSize,
            font_bold: fontBold,
            font_underline: fontUnderline,
            font_italic: fontItalic,
            font_strikeout: fontStrikeout,
            local_save: true,
            get_base64: getBase64
        }, callBack);
    }

    localImageDecontamination(
        imagePath: string,
        mode: string,
        color: string,
        x: number,
        y: number,
        width: number,
        height: number,
        getBase64: boolean,
        callBack: CallbackFunction
    ): void {
        this.sendCommand({
            func: "local_image_decontamination",
            iden: this.wslicence,
            image_path: imagePath,
            mode: mode,
            color: color,
            x: x,
            y: y,
            width: width,
            height: height,
            local_save: true,
            get_base64: getBase64
        }, callBack);
    }

    localImageDirectionCorrect(
        imagePath: string,
        getBase64: boolean,
        callBack: CallbackFunction
    ): void {
        this.sendCommand({
            func: "local_image_direction_correct",
            iden: this.wslicence,
            image_path: imagePath,
            local_save: true,
            get_base64: getBase64
        }, callBack);
    }

    /*****************************************文件管理相关********************************************************************************/

    getBatchIdList(callBack: CallbackFunction): void {
        this.sendCommand({
            func: "get_batch_id_list",
            iden: this.wslicence
        }, callBack);
    }

    openBatch(batchId: string, callBack: CallbackFunction): void {
        this.sendCommand({
            func: "open_batch",
            iden: this.wslicence,
            batch_id: batchId
        }, callBack);
    }

    deleteBatch(batchId: string, callBack: CallbackFunction): void {
        this.sendCommand({
            func: "delete_batch",
            iden: this.wslicence,
            batch_id: batchId
        }, callBack);
    }

    createNewBatch(batchId: string, callBack: CallbackFunction): void {
        this.sendCommand({
            func: "new_batch",
            iden: this.wslicence,
            batch_id: batchId
        }, callBack);
    }

    getCurrBatchId(callBack: CallbackFunction): void {
        this.sendCommand({
            func: "get_curr_batch_id",
            iden: this.wslicence
        }, callBack);
    }

    modifyBatchId(batchId: string, newBatchId: string, callBack: CallbackFunction): void {
        this.sendCommand({
            func: "modify_batch_id",
            iden: this.wslicence,
            batch_id: batchId,
            new_batch_id: newBatchId
        }, callBack);
    }

    getImageThumbnailList(callBack: CallbackFunction): void {
        this.sendCommand({
            func: "get_image_thumbnail_list",
            iden: this.wslicence
        }, callBack);
    }

    getImageCount(callBack: CallbackFunction): void {
        this.sendCommand({
            func: "get_image_count",
            iden: this.wslicence
        }, callBack);
    }

    bindFolder(folder: string, callBack: CallbackFunction): void {
        this.sendCommand({
            func: "bind_folder",
            iden: this.wslicence,
            folder: folder,
            name_mode: "order",
            name_width: 4,
            name_base: 0
        }, callBack);
    }

    stopBindFolder(callBack: CallbackFunction): void {
        this.sendCommand({
            func: "stop_bind_folder",
            iden: this.wslicence,
        }, callBack);
    }

    loadImage(imageIndex: number, callBack: CallbackFunction): void {
        this.sendCommand({
            func: "load_image",
            iden: imageIndex.toString(),
            image_index: imageIndex
        }, callBack);
    }

    saveImage(imageIndex: number, callBack: CallbackFunction): void {
        this.sendCommand({
            func: "save_image",
            iden: this.wslicence,
            image_index: imageIndex
        }, callBack);
    }

    insertLocalImage(imagePath: string, insertIndex: number, idenInfo: any, callBack: CallbackFunction): void {
        console.log('insertLocalImage insertIndex:', insertIndex, 'imagePath:', imagePath);
        this.sendCommand({
            func: "insert_local_image",
            iden: JSON.stringify(idenInfo),
            image_path: imagePath,
            insert_pos: insertIndex,
            image_tag: ''
        }, callBack);
    }

    insertImage(imageBase64: string, insertIndex: number, callBack: CallbackFunction): void {
        this.sendCommand({
            func: "insert_image",
            iden: this.wslicence,
            image_base64: imageBase64,
            insert_pos: insertIndex,
            image_tag: ''
        }, callBack);
    }

    modifyImageTag(imageIndexList: number[], imageTagList: string[], callBack: CallbackFunction): void {
        this.sendCommand({
            func: "modify_image_tag",
            iden: this.wslicence,
            image_index_list: imageIndexList,
            image_tag_list: imageTagList
        }, callBack);
    }

    deleteImage(imageIndexList: number[], callBack: CallbackFunction): void {
        this.sendCommand({
            func: "delete_image",
            iden: this.wslicence,
            image_index_list: imageIndexList
        }, callBack);
    }

    clearImageList(callBack: CallbackFunction): void {
        this.sendCommand({
            func: "clear_image_list",
            iden: this.wslicence
        }, callBack);
    }

    modifyImage(imageIndex: number, imageBase64: string, idenInfo: any, callBack: CallbackFunction): void {
        console.log('modifyImage imageIndex:', imageIndex);
        this.sendCommand({
            func: "modify_image",
            iden: idenInfo == null ? this.wslicence : JSON.stringify(idenInfo),
            image_index: imageIndex,
            image_base64: imageBase64
        }, callBack);
    }

    modifyImageByLocal(imageIndex: number, imagePath: string, callBack: CallbackFunction): void {
        this.sendCommand({
            func: "modify_image_by_local",
            iden: this.wslicence,
            image_index: imageIndex,
            image_path: imagePath
        }, callBack);
    }

    moveImage(imageIndexList: number[], target: number, callBack: CallbackFunction): void {
        this.sendCommand({
            func: "move_image",
            iden: this.wslicence,
            image_index_list: imageIndexList,
            mode: 'index',
            target: target
        }, callBack);
    }

    imageBookSort(callBack: CallbackFunction): void {
        this.sendCommand({
            func: "image_book_sort",
            iden: this.wslicence
        }, callBack);
    }

    mergeImage(
        imageIndexList: number[],
        mode: string,
        align: string,
        getBase64: boolean,
        callBack: CallbackFunction
    ): void {
        this.sendCommand({
            func: "merge_image",
            iden: this.wslicence,
            image_index_list: imageIndexList,
            mode: mode,
            align: align,
            interval: 0,
            get_base64: getBase64
        }, callBack);
    }

    makeMultiImage(imageIndexList: number[], format: string, callBack: CallbackFunction): void {
        const msg = {
            func: "make_multi_image",
            iden: this.wslicence,
            image_index_list: imageIndexList,
            format: format,
            tiff_compression: 'none',
            tiff_jpeg_quality: 80,
            get_base64: true
        };
        this.sendCommand(msg, callBack);
    }

    exchangeImage(index1: number, index2: number, callBack: CallbackFunction): void {
        this.sendCommand({
            func: "exchange_image",
            iden: this.wslicence,
            image_index_1: index1,
            image_index_2: index2
        }, callBack);
    }

    splitImage(imageIndex: number, mode: string, location: number, callBack: CallbackFunction): void {
        this.sendCommand({
            func: "split_image",
            iden: this.wslicence,
            image_index: imageIndex,
            mode: mode,
            location: location,
            get_base64: true
        }, callBack);
    }

    makeZipFile(imageIndexList: number[], callBack: CallbackFunction): void {
        this.sendCommand({
            func: "make_zip_file",
            iden: this.wslicence,
            image_index_list: imageIndexList,
            get_base64: true
        }, callBack);
    }

    imageDeskew(imageIndex: number, getBase64: boolean, callBack: CallbackFunction): void {
        this.sendCommand({
            func: "image_deskew",
            iden: this.wslicence,
            image_index: imageIndex,
            get_base64: getBase64
        }, callBack);
    }

    imageAddWatermark(imageIndex: number, markInfo: WaterMarkInfo, getBase64: boolean, callBack: CallbackFunction): void {
        const params = {
            func: "image_add_watermark",
            iden: this.wslicence,
            image_index: imageIndex,
            text: markInfo.text,
            text_color: markInfo.text_color,
            text_opacity: markInfo.text_opacity,
            text_pos: markInfo.text_pos,
            margin_left: markInfo.margin_left,
            margin_top: markInfo.margin_top,
            margin_right: markInfo.margin_right,
            margin_bottom: markInfo.margin_bottom,
            location_x: markInfo.location_x,
            location_y: markInfo.location_y,
            font_name: markInfo.font_name,
            font_size: markInfo.font_size,
            font_bold: markInfo.font_bold,
            font_underline: markInfo.font_underline,
            font_italic: markInfo.font_italic,
            font_strikeout: markInfo.font_strikeout,
            get_base64: getBase64
        };
        console.log('添加水印：params===', JSON.stringify(params));
        this.sendCommand(params, callBack);
    }

    imageDecontamination(
        imageIndex: number,
        mode: string,
        color: string,
        x: number,
        y: number,
        width: number,
        height: number,
        getBase64: boolean,
        callBack: CallbackFunction
    ): void {
        const params = {
            func: "image_decontamination",
            iden: this.wslicence,
            image_index: imageIndex,
            mode: mode,
            color: color,
            x: x,
            y: y,
            width: width,
            height: height,
            local_save: true,
            get_base64: getBase64
        };
        this.sendCommand(params, callBack);
    }

    imageFadebkColor(imageIndex: number, localSave: boolean, getBase64: boolean, callBack: CallbackFunction): void {
        const params = {
            func: "image_fade_bkcolor",
            iden: this.wslicence,
            image_index: imageIndex,
            local_save: localSave,
            get_base64: getBase64
        };
        this.sendCommand(params, callBack);
    }

    imageBinarization(imageIndex: number, localSave: boolean, getBase64: boolean, callBack: CallbackFunction): void {
        const params = {
            func: "image_binarization",
            iden: this.wslicence,
            image_index: imageIndex,
            local_save: localSave,
            get_base64: getBase64
        };
        this.sendCommand(params, callBack);
    }

    imageAdjustColors(
        imageIndex: number,
        brightness: number,
        contrast: number,
        gamma: number,
        localSave: boolean,
        getBase64: boolean,
        callBack: CallbackFunction
    ): void {
        const params = {
            func: "image_adjust_colors",
            iden: this.wslicence,
            image_index: imageIndex,
            brightness: brightness,
            contrast: contrast,
            gamma: gamma,
            local_save: localSave,
            get_base64: getBase64
        };
        this.sendCommand(params, callBack);
    }

    imageDirectionCorrect(imageIndex: number, getBase64: boolean, callBack: CallbackFunction): void {
        const params = {
            func: "image_direction_correct",
            iden: this.wslicence,
            image_index: imageIndex,
            local_save: true,
            get_base64: getBase64
        };
        this.sendCommand(params, callBack);
    }

    uploadImage(
        imageIndex: number,
        uploadMode: string,
        remoteFilePath: string,
        httpHost: string,
        httpPort: number,
        httpPath: string,
        ftpUser: string,
        ftpPassword: string,
        ftpHost: string,
        ftpPort: number,
        callBack: CallbackFunction
    ): void {
        console.log("----769 上传----")
        this.sendCommand({
            func: "upload_image",
            iden: this.wslicence,
            image_index: imageIndex,
            upload_mode: uploadMode,
            remote_file_path: remoteFilePath,
            http_host: httpHost,
            http_port: httpPort,
            http_path: httpPath,
            ftp_user: ftpUser,
            ftp_password: ftpPassword,
            ftp_host: ftpHost,
            ftp_port: ftpPort
        }, callBack);
    }

    /*****************************************socket相关********************************************************************************/

    private addCallBack(key: string, listener: CallbackFunction): void {
        this.callBackList.set(key, listener);
    }

    private removeCallBack(key: string): void {
        this.callBackList.delete(key);
    }

    getCallBack(key: string): CallbackFunction | undefined {
        return this.callBackList.get(key);
    }

    private sendCommand(json: any, callBackListener?: CallbackFunction): void {
        if (json.func && callBackListener) {
            this.addCallBack(json.func, callBackListener);
        }
        if (this.SocketClient && this.SocketClient.readyState === WebSocket.OPEN) {
            this.SocketClient.send(JSON.stringify(json));
        } else {
            console.error('WebSocket is not connected');
        }
    }

    initSocketIo(socketCallBack: (info: Result) => void): void {
        this.socketCallBacks = socketCallBack;
        console.log(TAG, "initSocketIo ===============" + 'ws:', this.wsUrl);

        try {
            this.SocketClient = new WebSocket(this.wsUrl);

            this.SocketClient.onopen = (msg) => {
                console.log(TAG, "connect onopen");
                //连接成功后去获取设备列表
                openDeviceSetting()
                socketCallBack({ code: SOCKET_CONNECTED, msg: "", data: null });
            };

            this.SocketClient.onmessage = (event) => {
                if (event && event.data) {
                    socketCallBack({ code: SOCKET_EVENT, msg: "", data: event.data });
                }
            };

            this.SocketClient.onclose = (msg) => {
                console.log(TAG, "connect onclose:", msg);
                console.log('WebSocket连接关闭，代码：' + msg.code + '，原因：' + msg.reason);

                socketCallBack({ code: SOCKET_DISCONNECTED, msg: "", data: msg });
            };

            this.SocketClient.onerror = (error) => {
                //error有东西，表示websocket连接失败，没有安装驱动，去下载
                console.error(TAG, "WebSocket 监听出现错误:", error);
            };

        } catch (error) {
            console.error(TAG, "WebSocket connection failed:", error);
        }
    }

    disconnect(): void {
        if (this.SocketClient) {
            this.SocketClient.onopen = null;
            this.SocketClient.onmessage = null;
            this.SocketClient.onclose = null;
            this.SocketClient.onerror = null;
            this.SocketClient.close();
            this.SocketClient = null;
        }
        this.callBackList.clear();
    }
}

export { WebScanController, type WebScanOptions, type Result, type WaterMarkInfo, type GlobalConfig };
