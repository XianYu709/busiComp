import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { fabric } from 'fabric'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import {WebScanController} from './WebScanController.ts'

interface ImageInfo {
    path: string;
    base64?: string;
    thumbnail: string;
}

interface ScanParams {
    color_mode: string;
    page_mode: string;
    resolution: number;
    brightness: number;
    contrast: number;
    gamma: number;
    paper_size: string;
    paper_cut_enabled: boolean;
    paper_cut_left: number;
    paper_cut_top: number;
    paper_cut_right: number;
    paper_cut_bottom: number;
    auto_crop: boolean;
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

interface InsertQueueItem {
    insertType: number;
    imagePath: string;
    insertIndex?: number;
    idenInfo: any;
}


// 响应式数据
const canvas = ref<fabric.Canvas | null>(null)
const image = ref<fabric.Image | null>(null)
const scale = ref(1)
const angle = ref(0)
const totalAngle = ref(0)
const rectificationDialog = ref(false)
const repSliderValue = ref(0)

const selectImageObj = reactive({
    image: null as ImageInfo | null,
    index: -1
})

const redoStack = ref<any[]>([])
const undoStack = ref<any[]>([])
const startP = ref<{x: number, y: number} | null>(null)
const assistLine = ref<fabric.Line | null>(null)
const assistText = ref<fabric.IText | null>(null)
const markText = ref<fabric.IText | null>(null)
const selectManyImages = ref<number[]>([])

const saveImagePath = ref('')
const urls = ref<ImageInfo[]>([])

const licence = ref('gE/rN4vZATMg49y/OCFlZA==')
const serverIP = ref('127.0.0.1')
const serverPort = ref('38999')
const debugMode = ref(false)
const fullscreenLoading = ref(false)

// 扫描相关状态
const scanMode = ref<'normal' | 'insert' | 'cover'>('normal')
const curInsertIndex = ref(-1)
const curCoverIndex = ref(-1)
const needCoverCount = ref(-1)

// 设备相关
const isSetup = ref(false)
const activeName = ref('1')
const devices = ref<string[]>([])
const currDevice = ref('')
const deviceOpened = ref(false)
const deviceInited = ref(false)

// 批次管理
const batchIdList = ref<string[]>([])
const showBatchList = ref(true)
const showExportType = ref(true)
const currentBatch = ref('')
const isScanning = ref(false)
const bindFolderPath = ref('')



// 配置对象
const scanParams = reactive<ScanParams>({
    color_mode: 'color',
    page_mode: 'duplex',
    resolution: 200,
    brightness: 100,
    contrast: 4,
    gamma: 1.00,
    paper_size: 'a4',
    paper_cut_enabled: false,
    paper_cut_left: 0.0,
    paper_cut_top: 0.0,
    paper_cut_right: 210.0,
    paper_cut_bottom: 297.0,
    auto_crop: false
})

const globalConfig = reactive<GlobalConfig>({
    file_save_path: 'C:\\',
    file_name_prefix: 'Doc',
    file_name_mode: 'date_time',
    image_format: 'jpg',
    image_jpeg_quality: 80,
    image_tiff_compression: 'lzw',
    image_tiff_jpeg_quality: 80,
})

// 插入队列
const insertQueue = ref<InsertQueueItem[]>([])
const insertLoopWork = ref<number>()

// WebScanController 实例 (需要根据实际实现调整)
let webScanController:any = null;


// 生命周期
onMounted(() => {
    const canvasContainer = document.getElementById('canvas-container')
    if (canvasContainer) {
        const width = canvasContainer.scrollWidth
        const height = canvasContainer.scrollHeight

        const fabricCanvas = new fabric.Canvas('imageCanvas', {
            allowTouchScrolling: true,
            centeredRotation: true,
            centeredScaling: true,
            defaultCursor: 'default',
            hoverCursor: 'default',
            backgroundColor: "#ffffff",
            backgroundVpt: true,
            width: width,
            height: height
        })

        canvas.value = fabricCanvas

        // 字体大小列表初始化
        for (let i = 11; i < 51; i++) {
            markFontSizeList.value.push(i)
        }

        initWebSocket()
    }
})

onUnmounted(() => {
    onCloseScreen()
})

// 方法定义
const initWebSocket = () => {
    // WebScanController 初始化
    console.log('初始化 WebSocket')
    webScanController = new WebScanController({
        wsUrl: 'ws://' + serverIP + ':' + serverPort + '/',
        wslicence: licence.value
        // 这里需要根据实际的 WebScanController 实现来定义
        //initSocketIo: (callback: Function) => {},
        //getGlobalConfig: (callback: Function) => {},
        // ... 其他方法
    })
    webScanController.deinitDevices(onSocketCallBack)
}

const onSocketCallBack = (info: any) => {
    switch (info.code) {
        case 'SOCKET_CONNECTED':
            connectEnable.value = false
            initData()
            console.log('socket connected')
            break
        case 'SOCKET_DISCONNECTED':
            connectEnable.value = true
            console.log('socket disconnect ！！！')
            break
        case 'SOCKET_EVENT':
            const parsedInfo = JSON.parse(info.data)
            dispatchEvent(parsedInfo)
            break
    }
}

const dispatchEvent = (info: any) => {
    if (info.func) {
        if (info.ret !== undefined && info.ret !== null) {
            if (info.ret === 0) {
                // 成功处理
                commonDispatch(info)
            } else {
                // 错误处理
                eleUnloadding()
                eleMessage(info.err_info || '未知异常', 'error')
            }
        } else {
            commonDispatch(info)
        }
    }
}

const commonDispatch = (info: any) => {
    eleUnloadding()

    switch (info.func) {
        case "device_arrive":
            eleMessage("设备已装载")
            break
        case "device_remove":
            eleMessage("设备已移除！")
            deinitDevices()
            deviceOpened.value = false
            deviceInited.value = false
            devices.value = []
            currDevice.value = ''
            break
        case "scan_begin":
            isScanning.value = true
            eleMessage("开始扫描")
            eleLoadding()
            break
        case "scan_end":
            isScanning.value = false
            clearCanvasData()
            eleMessage("扫描结束")
            clearInterval(window.loopinterval)
            eleUnloadding()
            break
        case "scan_image":
            var imagePath = info.image_path

            if (scanMode.value == 'insert') {//是插入扫描
                curCoverIndex.value = -1

                //找到文件位置，插入元素
                if (curInsertIndex.value != -1) {

                } else {
                    curInsertIndex.value = selectImageObj.index
                }

                console.log('插入扫描：队列插入位:' + curInsertIndex.value + " path:" + imagePath)

                insertQueue.value.push({
                    insertType: 2,
                    imagePath: imagePath,
                    insertIndex: curInsertIndex.value,
                    idenInfo: {
                        insertType: 2,
                        insertIndex: curInsertIndex.value,
                        path: imagePath,
                        base64: info.image_base64
                    },//签名
                })
                curInsertIndex.value++

            } else if (scanMode.value == 'cover') {//是覆盖扫描
                console.log('覆盖扫描，起始位index' + curCoverIndex.value + ' imagePath:' + imagePath + '  总长度位置：' + (urls.value.length - 1))
                console.log('需要覆盖的数量：' + needCoverCount.value)
                insertQueue.value.push({
                    insertType: 3,
                    imagePath: imagePath,
                    idenInfo: {
                        insertType: 3,
                        path: imagePath,
                        base64: info.image_base64
                    }
                })
            } else {//正常按顺序

                curCoverIndex.value = -1

                console.log('顺序扫描，队列插入位' + curInsertIndex.value + ' imagePath:' + imagePath)

                insertQueue.value.push({
                    insertType: 1,
                    imagePath: imagePath,
                    insertIndex: curInsertIndex.value,
                    idenInfo: {
                        insertType: 1,
                        path: imagePath,
                        insertIndex: curInsertIndex.value,
                        base64: info.image_base64
                    },//签名
                })
                curInsertIndex.value++
            }
            break
    }
}

// 其他方法需要继续转换...
const insertAction = (info: InsertQueueItem) => {
    // 实现插入逻辑

    if (info.insertType === 3) {//是覆盖扫描逻辑

        if (needCoverCount.value > 0) {//还在覆盖范围内，直接覆盖掉
            webScanController.modifyImage(curCoverIndex.value, info.idenInfo.base64, info.idenInfo, function (modifyInfo:any) {

                var idenInfo = JSON.parse(modifyInfo.iden);

                console.log('覆盖前：index==' + curCoverIndex.value + '  path:' + urls[curCoverIndex.value].path)

                urls[curCoverIndex.value].value = {
                    // base64: idenInfo.base64,
                    thumbnail: idenInfo.base64,
                    path: idenInfo.path
                }
                console.log('覆盖后：index==' + curCoverIndex.value + '  path:' + urls[curCoverIndex.value].path)

                curCoverIndex.value++
                needCoverCount.value--

                this.$forceUpdate()

                //把占位符删掉 继续下一轮循环
                if (insertQueue.value.length > 0 && insertQueue[0].insertType === -1) {
                    insertQueue.value.splice(0, 1)
                }
            })
        } else {//之后都是新增的往后添加了
            webScanController.insertLocalImage(info.imagePath, urls.value.length, info.idenInfo, function (result:any) {
                console.log('覆盖扫描：插入成功 index：' + urls.value.length)
                var idenInfo = JSON.parse(result.iden);

                urls.value.push({
                    path: idenInfo.path,
                    thumbnail: idenInfo.base64,
                    // base64: idenInfo.base64
                })
                this.$forceUpdate()

                this.$nextTick(function () {
                    if (this.$refs.imageArea) {
                        this.$refs.imageArea.scrollTop = this.$refs.imageArea.scrollHeight
                    }
                })


                //把占位符删掉 继续下一轮循环
                if (insertQueue.value.length > 0 && insertQueue[0].insertType === -1) {
                    insertQueue.value.splice(0, 1)
                }

            })
        }
    } else {
        webScanController.insertLocalImage(info.imagePath, info.insertIndex, info.idenInfo, function (result:any) {

            var idenInfo = JSON.parse(result.iden);
            if (idenInfo.insertType === 1) {
                //正常扫描，往后添加
                console.log('正常扫描：插入成功 index：' + idenInfo.insertIndex + ' path:' + idenInfo.path)
                //插入到正确位置
                urls.value.splice(idenInfo.insertIndex, 0, {
                    path: idenInfo.path,
                    thumbnail: idenInfo.base64,
                    // base64: idenInfo.base64
                })

                this.$nextTick(function () {
                    if (this.$refs.imageArea) {
                        this.$refs.imageArea.scrollTop = this.$refs.imageArea.scrollHeight
                    }
                })

            } else if (idenInfo.insertType === 2) {
                //插入扫描，指定位置
                console.log('插入扫描：插入index' + idenInfo.insertIndex + ' path:' + idenInfo.path)
                //插入到正确位置
                urls.value.splice(idenInfo.insertIndex, 0, {
                    path: idenInfo.path,
                    thumbnail: idenInfo.base64,
                    // base64: idenInfo.base64
                })
                this.$forceUpdate()
            }

            //把占位符删掉 继续下一轮循环
            if (insertQueue.value.length > 0 && insertQueue[0].insertType === -1) {
                insertQueue.value.splice(0, 1)
            }
        })
    }
}

const initData = () => {
    getGlobalConfig()
    getBatchList(() => {
        changeBatch(batchIdList.value.slice(-1)[0])
    })
    stopBindFolder()
}
//停止绑定文件夹
const stopBindFolder = ()=> {
    webScanController.stopBindFolder(function (info) {
        console.log('解绑文件夹成功！')
    })
}
//切换批次
const changeBatch = (batchId:any) {
    console.log('切换批次：' + batchId)
    showBatchList.value = false
    image.value = null
    undoStack.value.length = 0;
    redoStack.value.length = 0;

    eleLoadding()
    webScanController.openBatch(batchId, function (info) {
        console.log('打开批次：' + JSON.stringify(info))
        urls.value.length = 0//先清空一下
        currentBatch.value = batchId
        //重新加载
        reLoadImageList()
    })
}
//获取当前批次的图像列表
const reLoadImageList = ()=> {

    eleLoadding()
    clearCanvasData()

    /*       this.WebScanController.getImageCount(function (info) {
               that.eleUnloadding()

               console.log('当前批次图片数量为：' + JSON.stringify(info))
               that.urls = new Array(info.image_count).fill('')

               for (var i = 0; i < that.urls.length; i++) {
                   that.WebScanController.loadImage(i, function (imageInfo) {
                       console.log('iden===' + imageInfo.iden)
                       that.urls[imageInfo.iden] = {
                           path: '',
                           base64: imageInfo.image_base64
                       }
                       that.$forceUpdate()
                       console.log('加载批次图片 index:' + i + "  info:" + JSON.stringify(imageInfo))
                       console.log('urls结果：' + that.urls)
                   })

               }
           })*/

    //获取缩略图
    webScanController.getImageThumbnailList(function (info:any) {
        eleUnloadding()
        // “image_thumbnail_list”:[{“image_tag”:”001”, “image_base64”:”xxx”}]
        console.log('缩略图个数：' + info.image_thumbnail_list.length)
        urls.value.length = 0

        for (var i = 0; i < info.image_thumbnail_list.length; i++) {
            urls.value.push({
                path: '',
                base64: '',
                thumbnail: info.image_thumbnail_list[i].image_base64//缩略图
            })
        }
        webScanController.$forceUpdate()
    })
}
const onCloseScreen = () => {
    releaseService()
    if (insertLoopWork.value) {
        clearInterval(insertLoopWork.value)
    }
}

const releaseService = () => {
    console.log('releaseService')
    deinitDevices()
     webScanController.clearGlobalFileSavePath(function (info) {
         console.log('网页关闭，清理文件成功')
     })
    if (webScanController) {
        webScanController.disconnect()
    }
}

// 设备控制方法
const getGlobalConfig = () => {
    // 实现获取全局配置
    webScanController.getGlobalConfig(function (info:any) {
        console.log('getGlobalConfig :' + info)
        webScanController.globalConfig = info
        // var pre = info.file_save_path
        // if (pre.endsWith("\\")) {
        //     that.bindFolderPath = pre + 'auto'
        // } else {
        //     that.bindFolderPath = pre + '\\auto'
        // }
        // that.bindFolder()
    })
}

const initDevice = (succcallBack?: Function) => {
    // 实现设备初始化
}

const deinitDevices = () => {
    // 实现设备反初始化
    if (deviceInited.value == false) {
        return
    }
    webScanController.deinitDevices(function (info) {
        console.log('deinit Devices :' + info)
        deviceInited.value = false
        deviceInited.value = false
    })
}



const clearCanvasData = () => {
    image.value = null
    selectImageObj.image = null
    selectImageObj.index = -1
    undoStack.value = []
    redoStack.value = []
}

// 工具方法
const eleLoadding = () => {
    fullscreenLoading.value = true
}

const eleUnloadding = () => {
    fullscreenLoading.value = false
}

const eleMessage = (msg: string, type: 'success' | 'warning' | 'info' | 'error' = 'success') => {
    ElMessage({
        message: msg,
        type: type,
        duration: 2000
    })
}

const clearDivListener = () => {
    // 清理事件监听器
}
//获取最后批次的内容
const getBatchList = (succeccCallBack:any)=> {
    webScanController.getBatchIdList(function (info:any) {
        console.log('批次列表：' + JSON.stringify(info))
        batchIdList.value.length = 0
        for (var i = 0; i < info.batch_id_list.length; i++) {
            batchIdList.value.push(info.batch_id_list[i])
        }
        succeccCallBack()
    })
}
const disconnect = ()=> {
    if (socketClient) {
        socketClient.close()
        socketClient = null
    }
}

// 原有的其他方法需要继续转换...
// 由于代码量巨大，这里只展示了关键部分的转换

// 响应式数据继续定义...
const connectEnable = ref(false)
const showBigImageDialog = ref(false)
const selectBigImage = ref('')
const markFontSizeList = ref<number[]>([])
    // ... 其他响应式数据

